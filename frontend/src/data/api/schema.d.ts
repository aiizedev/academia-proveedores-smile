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
    "/api/v1/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Login
         * @description Ingreso con celular o correo (RF-IAM-002); bloqueo tras intentos fallidos (RF-IAM-006).
         */
        post: operations["login_api_v1_auth_login_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Logout */
        post: operations["logout_api_v1_auth_logout_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Refresh
         * @description Rota el refresh token; si se reutiliza uno ya rotado, revoca la sesión (RNF-SEC-003).
         */
        post: operations["refresh_api_v1_auth_refresh_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/catalog/bundle": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Bundle
         * @description Categorías con sus ejes y parámetros vigentes (RF-CAT-001, 002, 004).
         */
        get: operations["bundle_api_v1_catalog_bundle_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Me */
        get: operations["me_api_v1_me_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me/supplier": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * My Supplier
         * @description Ficha del proveedor autenticado; `profile` es nulo hasta completarla (HU-SUP-01).
         *
         *     La escritura llega por sync (`supplier_profile`, P2), no por REST (PLAN_BACKEND §5).
         */
        get: operations["my_supplier_api_v1_me_supplier_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/sync/pull": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Pull
         * @description Cambios del proveedor posteriores a `last_pulled_at` (ms) y el nuevo `timestamp`.
         */
        get: operations["pull_api_v1_sync_pull_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/sync/push": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Push
         * @description Aplica el lote registro por registro; reenviar el mismo `mutation_id` devuelve el
         *     resultado guardado (RF-SYN-002). Acepta `Content-Encoding: gzip`.
         */
        post: operations["push_api_v1_sync_push_post"];
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
        /** CatalogBundleOut */
        CatalogBundleOut: {
            /** Categories */
            categories: components["schemas"]["CategoryOut"][];
            /** Parameters */
            parameters: {
                [key: string]: components["schemas"]["ParameterSetOut"];
            };
        };
        /** CategoryOut */
        CategoryOut: {
            /** Axes */
            axes: components["schemas"]["smile__modules__catalog__api__schemas__AxisOut"][];
            /** Code */
            code: string;
            /** Icon */
            icon: string;
            /** Name */
            name: string;
            /**
             * Status
             * @enum {string}
             */
            status: "ACTIVA" | "PROXIMAMENTE";
        };
        /** HTTPValidationError */
        HTTPValidationError: {
            /** Detail */
            detail?: components["schemas"]["ValidationError"][];
        };
        /** LoginIn */
        LoginIn: {
            /**
             * Identifier
             * @description Celular o correo
             */
            identifier: string;
            /** Password */
            password: string;
        };
        /** MeOut */
        MeOut: {
            /** Email */
            email: string | null;
            /** Full Name */
            full_name: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Phone */
            phone: string | null;
            /**
             * Role
             * @enum {string}
             */
            role: "PROVEEDOR" | "REVIEWER" | "ADMIN";
        };
        /** MySupplierOut */
        MySupplierOut: {
            /**
             * Id
             * Format: uuid
             */
            id: string;
            profile: components["schemas"]["ProfileOut"] | null;
            /** Profile Completed At */
            profile_completed_at: string | null;
        };
        /** ParameterSetOut */
        ParameterSetOut: {
            /**
             * Valid From
             * Format: date-time
             */
            valid_from: string;
            /** Value */
            value: {
                [key: string]: unknown;
            };
            /** Version */
            version: number;
        };
        /** PlanItemOut */
        PlanItemOut: {
            /** Axis */
            axis: string;
            /** Priority */
            priority: string;
        };
        /** ProfileOut */
        ProfileOut: {
            /**
             * Contact Channel
             * @enum {string}
             */
            contact_channel: "whatsapp" | "llamada" | "correo";
            /** Department Code */
            department_code: string;
            /** Latitude */
            latitude: string | null;
            /** Legal Name */
            legal_name: string;
            /** Legal Rep */
            legal_rep: string | null;
            /** Longitude */
            longitude: string | null;
            /** Main Category */
            main_category: string;
            /** Municipality Code */
            municipality_code: string;
            /**
             * Person Type
             * @enum {string}
             */
            person_type: "natural" | "juridica";
            /** Secondary Categories */
            secondary_categories: string[];
            /** Tax Dv */
            tax_dv: string;
            /** Tax Id */
            tax_id: string;
            /** Vereda */
            vereda: string | null;
        };
        /** PullOut */
        PullOut: {
            /** Changes */
            changes: {
                [key: string]: {
                    [key: string]: unknown[];
                };
            };
            /** Timestamp */
            timestamp: number;
        };
        /** PushIn */
        PushIn: {
            /** Changes */
            changes: {
                [key: string]: components["schemas"]["TableChangesIn"];
            };
            /** Last Pulled At */
            last_pulled_at?: number | null;
            /**
             * Mutation Id
             * Format: uuid
             */
            mutation_id: string;
            /**
             * Priority
             * @enum {string}
             */
            priority: "P1" | "P2" | "P3";
        };
        /** PushOut */
        PushOut: {
            /** Accepted */
            accepted: string[];
            /** Rejected */
            rejected: components["schemas"]["RejectedOut"][];
        };
        /** RefreshIn */
        RefreshIn: {
            /** Refresh Token */
            refresh_token: string;
        };
        /** RejectedOut */
        RejectedOut: {
            /** Code */
            code: string;
            /** Id */
            id: string;
            /** Message */
            message: string;
            /** Table */
            table: string;
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
                [key: string]: components["schemas"]["smile__modules__assessment__api__schemas__AxisOut"];
            };
            /** Pillar1 */
            pillar1: number | null;
            /** Plan */
            plan: components["schemas"]["PlanItemOut"][];
        };
        /** SessionOut */
        SessionOut: {
            /** Access Token */
            access_token: string;
            /** Expires In */
            expires_in: number;
            /** Refresh Token */
            refresh_token: string;
            /**
             * Token Type
             * @default bearer
             * @constant
             */
            token_type: "bearer";
            user: components["schemas"]["MeOut"];
        };
        /** TableChangesIn */
        TableChangesIn: {
            /** Created */
            created?: {
                [key: string]: unknown;
            }[];
            /** Deleted */
            deleted?: string[];
            /** Updated */
            updated?: {
                [key: string]: unknown;
            }[];
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
        /**
         * AxisOut
         * @description Puntajes como número JSON con 2 decimales (ya redondeados half-up en el dominio).
         */
        smile__modules__assessment__api__schemas__AxisOut: {
            /** Level */
            level: string | null;
            /** Score */
            score: number | null;
            /** Urgent */
            urgent: boolean;
        };
        /** AxisOut */
        smile__modules__catalog__api__schemas__AxisOut: {
            /** Code */
            code: string;
            /** Icon */
            icon: string;
            /** Name */
            name: string;
            /** Short Name */
            short_name: string;
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
    login_api_v1_auth_login_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginIn"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionOut"];
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
    logout_api_v1_auth_logout_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefreshIn"];
            };
        };
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
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
    refresh_api_v1_auth_refresh_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefreshIn"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionOut"];
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
    bundle_api_v1_catalog_bundle_get: {
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
                    "application/json": components["schemas"]["CatalogBundleOut"];
                };
            };
        };
    };
    me_api_v1_me_get: {
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
                    "application/json": components["schemas"]["MeOut"];
                };
            };
        };
    };
    my_supplier_api_v1_me_supplier_get: {
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
                    "application/json": components["schemas"]["MySupplierOut"];
                };
            };
        };
    };
    pull_api_v1_sync_pull_get: {
        parameters: {
            query?: {
                last_pulled_at?: number;
                schema_version?: number | null;
            };
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
                    "application/json": components["schemas"]["PullOut"];
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
    push_api_v1_sync_push_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PushIn"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PushOut"];
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
