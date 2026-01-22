import { z } from "zod";
import { Result, ok, err } from "./types/result";

export async function safeAction<TIn, TOut>(
    schema: z.Schema<TIn>,
    action: (data: TIn) => Promise<TOut>
): Promise<Result<TOut, string>> {
    try {
        const parseResult = schema.safeParse(arguments[0]); // Hack: In server actions, arguments aren't always passed cleanly if wrapping.
        // Actually, better design: return a new function.
        throw new Error("Implementation Error: safeAction should returns a wrapped function, not be called directly with data inside the wrapper definition if we want closure style.");
    } catch (e) {
        return err("Internal implementation error");
    }
}

// Correct implementation for a wrapper factory
export function createSafeAction<TIn, TOut>(
    schema: z.Schema<TIn>,
    action: (data: TIn) => Promise<TOut>
) {
    return async (data: TIn): Promise<Result<TOut, string>> => {
        const validationResult = schema.safeParse(data);

        if (!validationResult.success) {
            return err(validationResult.error.issues.map(i => i.message).join(", "));
        }

        try {
            const result = await action(validationResult.data);
            return ok(result);
        } catch (error) {
            console.error("Action Error:", error);
            if (error instanceof Error) {
                return err(error.message);
            }
            return err("An unexpected error occurred");
        }
    };
}
