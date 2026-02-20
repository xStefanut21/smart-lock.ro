import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface RedirectRule {
  id: string;
  source_url: string;
  target_url: string;
  status_code: 301 | 302 | 307 | 308;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * SEO Redirect Middleware
 *
 * Handles 301/302 redirects from database to maintain SEO ranking
 * Prevents 404 errors by redirecting old URLs to new locations
 */
export async function redirectMiddleware(request: NextRequest): Promise<NextResponse | null> {
  try {
    const pathname = request.nextUrl.pathname;
    const searchParams = request.nextUrl.searchParams.toString();
    const fullUrl = `${pathname}${searchParams ? `?${searchParams}` : ''}`;

    // Skip middleware for API routes, static files, and admin routes
    if (
      pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/admin/') ||
      pathname.includes('.')
    ) {
      return null;
    }

    // Create Supabase client for server-side operations
    const supabase = createSupabaseServerClient();

    // Query redirects from database
    const { data: redirects, error } = await supabase
      .from('seo_redirects')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching redirects:', error);
      return null;
    }

    if (!redirects || redirects.length === 0) {
      return null;
    }

    // Find matching redirect rule
    const matchingRedirect = findMatchingRedirect(redirects as RedirectRule[], fullUrl, pathname);

    if (!matchingRedirect) {
      return null;
    }

    // Log redirect for analytics
    console.log(`SEO Redirect: ${fullUrl} -> ${matchingRedirect.target_url} (${matchingRedirect.status_code})`);

    // Create redirect response
    const redirectUrl = buildRedirectUrl(matchingRedirect.target_url, request);

    return NextResponse.redirect(redirectUrl, {
      status: matchingRedirect.status_code,
    });

  } catch (error) {
    console.error('Redirect middleware error:', error);
    return null;
  }
}

/**
 * Find matching redirect rule for the current URL
 */
function findMatchingRedirect(redirects: RedirectRule[], fullUrl: string, pathname: string): RedirectRule | null {
  // First, try exact match with full URL
  let match = redirects.find(r => r.source_url === fullUrl);

  // If no exact match, try pathname only
  if (!match) {
    match = redirects.find(r => r.source_url === pathname);
  }

  // Try pattern matching (basic wildcard support)
  if (!match) {
    for (const redirect of redirects) {
      if (redirect.source_url.includes('*')) {
        const pattern = redirect.source_url.replace(/\*/g, '.*');
        const regex = new RegExp(`^${pattern}$`);
        if (regex.test(fullUrl) || regex.test(pathname)) {
          match = redirect;
          break;
        }
      }
    }
  }

  // Try case-insensitive match
  if (!match) {
    match = redirects.find(r =>
      r.source_url.toLowerCase() === fullUrl.toLowerCase() ||
      r.source_url.toLowerCase() === pathname.toLowerCase()
    );
  }

  return match || null;
}

/**
 * Build the redirect URL, handling relative and absolute URLs
 */
function buildRedirectUrl(targetUrl: string, request: NextRequest): URL {
  // If target URL is absolute, use it as-is
  if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
    return new URL(targetUrl);
  }

  // If target URL starts with '/', it's relative to the current domain
  if (targetUrl.startsWith('/')) {
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    return new URL(targetUrl, baseUrl);
  }

  // Otherwise, treat as relative to current path
  const currentPath = request.nextUrl.pathname;
  const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
  const fullPath = basePath + targetUrl;

  const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
  return new URL(fullPath, baseUrl);
}

/**
 * Validate redirect rule data
 */
export function validateRedirectRule(rule: Partial<RedirectRule>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!rule.source_url?.trim()) {
    errors.push('Source URL is required');
  }

  if (!rule.target_url?.trim()) {
    errors.push('Target URL is required');
  }

  if (rule.source_url === rule.target_url) {
    errors.push('Source and target URLs cannot be the same');
  }

  if (rule.status_code && ![301, 302, 307, 308].includes(rule.status_code)) {
    errors.push('Status code must be 301, 302, 307, or 308');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get all active redirects for admin management
 */
export async function getActiveRedirects(): Promise<RedirectRule[]> {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from('seo_redirects')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching redirects:', error);
    return [];
  }
}

/**
 * Create or update redirect rule
 */
export async function saveRedirectRule(rule: Omit<RedirectRule, 'id' | 'created_at' | 'updated_at'>): Promise<{
  success: boolean;
  data?: RedirectRule;
  error?: string;
}> {
  try {
    const validation = validateRedirectRule(rule);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', ')
      };
    }

    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from('seo_redirects')
      .upsert({
        ...rule,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: data as RedirectRule
    };
  } catch (error) {
    console.error('Error saving redirect rule:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
