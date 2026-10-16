# ADR-0006 · Cifrado local de campos sensibles y sesión offline

- **Estado:** Aceptada · 2026-10-15
- **Contexto:** SPEC-DASH §1.2 exige cifrado simétrico en el dispositivo; WatermelonDB no cifra (C-14). El proveedor puede pasar días sin señal (S-13).
- **Decisión:** Al iniciar sesión se genera una clave AES-GCM 256 no exportable con WebCrypto, guardada en IndexedDB como `CryptoKey`. Se cifran a nivel de campo: valores financieros, caracterización sensible, firmas y el refresh token. La sesión offline vale hasta el vencimiento del refresh token (30 días). Cerrar sesión borra la clave (RF-IAM-009).
- **Consecuencias:** (+) Cumple el spec sin abandonar WatermelonDB. (−) Los campos cifrados no se pueden indexar ni filtrar localmente; los agregados (totales) se calculan al descifrar en memoria, aceptable para el volumen de un proveedor.
