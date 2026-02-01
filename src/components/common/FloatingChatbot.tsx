"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MessageSquare, Send, X, Bot, User, Minus, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { chatAssistant } from "@/lib/actions/ai-actions";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight, oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";

import "katex/dist/katex.min.css";

interface Message {
    role: "assistant" | "user";
    content: string;
    timestamp: Date;
}

export default function FloatingChatbot() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const { theme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "আসসালামু আলাইকুম! আমি GiNi, আপনার একাডেমিক অ্যাসিস্ট্যান্ট। আমি আপনাকে আপনার পড়াশোনা সম্পর্কিত যেকোনো প্রশ্ন উত্তর দিয়ে সাহায্য করতে পারি।",
            timestamp: new Date(),
        },
    ]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    // Hide if not logged in or on auth/login pages
    if (status !== 'authenticated' ||
        pathname?.includes('/auth/') ||
        pathname?.includes('/login') ||
        pathname?.includes('/register')
    ) return null;

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const result = await chatAssistant({ question: userMessage.content });

            if (result.success) {
                const aiMessage: Message = {
                    role: "assistant",
                    content: result.data.answer,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, aiMessage]);
            } else {
                toast.error(result.error || "একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।");
            }
        } catch (error) {
            toast.error("সার্ভারে সমস্যা হয়েছে।");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 rounded-full bg-teal-600 hover:bg-teal-700 shadow-2xl shadow-teal-600/40 p-0 group"
                >
                    <Bot className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
                </Button>
            </div>
        );
    }

    return (
        <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isMinimized ? 'h-14' : 'h-[500px]'} w-[380px] max-w-[calc(100vw-3rem)]`}>
            <Card className="h-full flex flex-col shadow-2xl border-none ring-1 ring-zinc-200 dark:ring-zinc-800 overflow-hidden">
                <CardHeader className="bg-teal-600 text-white py-3 px-4 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                            <Bot className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-bengali">একাডেমিক অ্যাসিস্ট্যান্ট</CardTitle>
                            <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-[10px] text-teal-100">অনলাইন</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-white hover:bg-white/10"
                            onClick={() => setIsMinimized(!isMinimized)}
                        >
                            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-white hover:bg-white/10"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>

                {!isMinimized && (
                    <>
                        <CardContent className="flex-1 p-0 flex flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-950">
                            <ScrollArea className="flex-1 p-4" viewportRef={scrollRef}>
                                <div className="space-y-4">
                                    {messages.map((msg, i) => (
                                        <div
                                            key={i}
                                            className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${msg.role === 'assistant'
                                                ? 'bg-teal-50 border-teal-100 text-teal-600'
                                                : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                                                }`}>
                                                {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                            </div>
                                            <div className={`flex flex-col gap-1 max-w-[85%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                                                <div className={`p-3 rounded-2xl text-xs font-bengali leading-relaxed shadow-sm prose prose-sm dark:prose-invert prose-p:my-0 prose-headings:text-teal-600 dark:prose-headings:text-teal-400 ${msg.role === 'assistant'
                                                    ? 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-100 dark:border-zinc-800'
                                                    : 'bg-teal-600 text-white rounded-tr-none'
                                                    }`}>
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkMath]}
                                                        rehypePlugins={[rehypeKatex]}
                                                        components={{
                                                            code({ node, inline, className, children, ...props }: any) {
                                                                const match = /language-(\w+)/.exec(className || "");
                                                                return !inline && match ? (
                                                                    <SyntaxHighlighter
                                                                        style={theme === "dark" ? oneDark : oneLight}
                                                                        language={match[1]}
                                                                        PreTag="div"
                                                                        {...props}
                                                                    >
                                                                        {String(children).replace(/\n$/, "")}
                                                                    </SyntaxHighlighter>
                                                                ) : (
                                                                    <code className={className} {...props}>
                                                                        {children}
                                                                    </code>
                                                                );
                                                            },
                                                        }}
                                                    >
                                                        {msg.content
                                                            .replace(/\\\[/g, "$$")
                                                            .replace(/\\\]/g, "$$")
                                                            .replace(/\\\(/g, "$")
                                                            .replace(/\\\)/g, "$")
                                                        }
                                                    </ReactMarkdown>
                                                </div>
                                                <span className="text-[9px] text-zinc-400 px-1">
                                                    {msg.timestamp.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {loading && (
                                        <div className="flex items-start gap-2.5">
                                            <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                                                <Bot className="w-4 h-4" />
                                            </div>
                                            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-3 rounded-2xl rounded-tl-none flex items-center gap-1 shadow-sm">
                                                <span className="w-1 h-1 bg-zinc-300 rounded-full animate-bounce" />
                                                <span className="w-1 h-1 bg-zinc-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                <span className="w-1 h-1 bg-zinc-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>

                            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                                <form
                                    className="flex items-center gap-2"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSend();
                                    }}
                                >
                                    <Input
                                        placeholder="আপনার প্রশ্ন লিখুন..."
                                        className="h-10 text-xs font-bengali border-zinc-200 focus-visible:ring-teal-600"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        disabled={loading}
                                    />
                                    <Button
                                        type="submit"
                                        size="icon"
                                        className="h-10 w-10 shrink-0 bg-teal-600 hover:bg-teal-700 shadow-md"
                                        disabled={loading || !input.trim()}
                                    >
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </form>
                                <p className="text-[9px] text-center text-zinc-400 mt-2 font-bengali">
                                    GiNi ভুল তথ্য দিতে পারে। গুরুত্বপূর্ণ উত্তরের জন্য ওস্তাদের পরামর্শ নিন।
                                </p>
                            </div>
                        </CardContent>
                    </>
                )}
            </Card>
        </div>
    );
}
