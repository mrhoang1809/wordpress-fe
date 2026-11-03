/**
 * AuthProvider — compatibility shim.
 *
 * The old Context-based AuthProvider has been replaced by:
 *   - Zustand store  (src/store/auth.store.ts)
 *   - AuthBootstrap  (src/features/auth/AuthBootstrap.tsx)
 *   - useAuth hook   (src/features/auth/useAuth.ts)
 *
 * This file re-exports useAuth so that existing components that import
 * { useAuth } from '@/features/auth/AuthProvider' keep working without changes.
 */
export { useAuth } from './useAuth';
