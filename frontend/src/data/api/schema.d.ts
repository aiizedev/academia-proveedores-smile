/* GENERADO por scripts/api-gen.mjs desde contracts/openapi.json — no editar aquí. */
export interface paths {
    "/api/v1/assessment/score-preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Score Preview
         * @description Calcula ejes, Pilar 1 y plan de 3 metas sin persistir (RF-ASM-005…008, RF-IMP-001).
         */
        post: operations["score_preview_api_v1_assessment_score_preview_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health/live": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Live */
        get: operations["live_health_live_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health/ready": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Ready */
        get: operations["ready_health_ready_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/metrics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Metrics */
        get: operations["metrics_metrics_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** AnswerIn */
        AnswerIn: {
            /**
             * Answer
             * @enum {string}
             */
            answer: "si" | "aveces" | "no" | "na" | "pnr";
            /** Axis */
            axis: string;
            /** Critical When */
            critical_when?: ("si" | "aveces" | "no" | "na" | "pnr")[];
            /** Id */
            id: string;
            /** Weight */
            weight: number;
        };
        /**
         * AxisOut
         * @description Puntajes como número JSON con 2 decimales (ya redondeados half-up en el dominio).
         */
        AxisOut: {
            /** Level */
            level: string | null;
            /** Score */
            score: number | null;
            /** Urgent */
            urgent: boolean;
        };
        /** HTTPValidationError */
        HTTPValidationError: {
            /** Detail */
            detail?: components["schemas"]["ValidationError"][];
        };
        /** PlanItemOut */
        PlanItemOut: {
            /** Axis */
            axis: string;
            /** Priority */
            priority: string;
        };
        /** ScorePreviewIn */
        ScorePreviewIn: {
            /** Answers */
            answers: components["schemas"]["AnswerIn"][];
            /**
             * Category
             * @default fruver
             */
            category: string;
        };
        /** ScorePreviewOut */
        ScorePreviewOut: {
            /** Axes */
            axes: {
                [key: string]: components["schemas"]["AxisOut"];
            };
            /** Pillar1 */
            pillar1: number | null;
            /** Plan */
            plan: components["schemas"]["PlanItemOut"][];
        };
        /** ValidationError */
        ValidationError: {
            /** Context */
            ctx?: Record<string, never>;
            /** Input */
            input?: unknown;
            /** Location */
            loc: (string | number)[];
            /** Message */
            msg: string;
            /** Error Type */
            type: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    score_preview_api_v1_assessment_score_preview_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ScorePreviewIn"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ScorePreviewOut"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    live_health_live_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: string;
                    };
                };
            };
        };
    };
    ready_health_ready_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    metrics_metrics_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": string;
                };
            };
        };
    };
}
