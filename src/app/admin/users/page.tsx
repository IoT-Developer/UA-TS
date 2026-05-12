import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { formatRelativeTime } from '@/lib/utils';
import { AdminPageHeader, StatusBadge, EmptyState } from '@/components/admin/ui';
import type { Prisma } from '@prisma/client';

export const metadata = { title: 'Users — Admin' };

const PAGE_SIZE = 20;

interface PageProps {
  searchParams: Promise<{ q?: string; role?: string; deleted?: string; page?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  await requireAdmin();
  const params = await searchParams;
  const query = (params.q || '').trim();
  const role = (params.role || '').trim().toUpperCase();
  const showDeleted = params.deleted === '1';
  const page = Math.max(1, parseInt(params.page || '1', 10));

  const where: Prisma.UserWhereInput = {
    deletedAt: showDeleted ? { not: null } : null,
  };
  if (role && ['STUDENT', 'INSTRUCTOR', 'ADMIN'].includes(role)) {
    where.role = role as 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  }
  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } },
      { college: { contains: query, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { _count: { select: { enrollments: true, orders: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <AdminPageHeader
        eyebrow="Admin / Users"
        title="All users"
        subtitle={`${total.toLocaleString()} ${showDeleted ? 'deleted' : 'active'} ${
          total === 1 ? 'user' : 'users'
        }${query ? ` matching "${query}"` : ''}${role ? ` with role ${role}` : ''}`}
      />

      <div className="mx-auto max-w-screen-2xl space-y-6 px-6 py-8 lg:px-8">
        {/* Filters */}
        <form className="flex flex-wrap items-center gap-3 rounded-2xl border border-ink/15 bg-bg p-4">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search by name, email, or college..."
            className="min-w-64 flex-1 rounded-full border border-ink/15 bg-bg px-4 py-2 text-sm placeholder:text-ink-subtle focus:border-ink focus:outline-none"
          />
          <select
            name="role"
            defaultValue={role}
            className="rounded-full border border-ink/15 bg-bg px-4 py-2 font-mono text-xs uppercase tracking-wider"
          >
            <option value="">All roles</option>
            <option value="STUDENT">Students</option>
            <option value="INSTRUCTOR">Instructors</option>
            <option value="ADMIN">Admins</option>
          </select>
          <label className="flex cursor-pointer items-center gap-2 font-mono text-xs uppercase tracking-wider text-ink-muted">
            <input type="checkbox" name="deleted" value="1" defaultChecked={showDeleted} />
            Deleted
          </label>
          <button
            type="submit"
            className="rounded-full bg-ink px-5 py-2 font-mono text-xs uppercase tracking-widest text-bg hover:bg-accent"
          >
            Filter
          </button>
          <Link
            href="/admin/users"
            className="font-mono text-xs uppercase tracking-wider text-ink-muted hover:text-ink"
          >
            Reset
          </Link>
        </form>

        {/* Table */}
        {users.length === 0 ? (
          <EmptyState
            title="No users match"
            body="Try changing or clearing the filters above."
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-ink/15 bg-bg">
            <div className="hidden border-b border-ink/10 px-6 py-3 font-mono text-[0.65rem] uppercase tracking-widest text-ink-subtle md:grid md:grid-cols-12">
              <div className="col-span-4">User</div>
              <div className="col-span-3">College / branch</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-1 text-right">Enrolls</div>
              <div className="col-span-2 text-right">Joined</div>
            </div>
            {users.map((u, i) => (
              <Link
                key={u.id}
                href={`/admin/users/${u.id}`}
                className={`grid grid-cols-1 gap-2 px-6 py-4 transition hover:bg-bg-alt md:grid-cols-12 md:items-center ${
                  i < users.length - 1 ? 'border-b border-ink/5' : ''
                }`}
              >
                <div className="col-span-4 min-w-0">
                  <div className="truncate font-medium text-ink">
                    {u.name || <span className="text-ink-subtle italic">No name</span>}
                  </div>
                  <div className="truncate font-mono text-xs text-ink-subtle">{u.email}</div>
                </div>
                <div className="col-span-3 truncate text-sm text-ink-muted">
                  {u.college ? (
                    <>
                      {u.college}
                      {u.branch && (
                        <span className="ml-1 font-mono text-xs text-ink-subtle">· {u.branch}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-ink-subtle italic">—</span>
                  )}
                </div>
                <div className="col-span-2">
                  <StatusBadge
                    status={u.role.toLowerCase()}
                    variant={u.role === 'ADMIN' ? 'accent' : u.role === 'INSTRUCTOR' ? 'warning' : 'neutral'}
                  />
                </div>
                <div className="col-span-1 font-mono text-sm md:text-right">
                  {u._count.enrollments}
                </div>
                <div className="col-span-2 font-mono text-xs text-ink-subtle md:text-right">
                  {formatRelativeTime(u.createdAt)}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            baseHref={`/admin/users?${new URLSearchParams({
              ...(query && { q: query }),
              ...(role && { role }),
              ...(showDeleted && { deleted: '1' }),
            }).toString()}`}
          />
        )}
      </div>
    </>
  );
}

function Pagination({
  page,
  totalPages,
  baseHref,
}: {
  page: number;
  totalPages: number;
  baseHref: string;
}) {
  const sep = baseHref.includes('?') && !baseHref.endsWith('?') ? '&' : '';
  return (
    <div className="flex items-center justify-center gap-2 font-mono text-xs">
      {page > 1 ? (
        <Link
          href={`${baseHref}${sep}page=${page - 1}`}
          className="rounded-full border border-ink/15 px-4 py-2 uppercase tracking-wider text-ink-muted hover:bg-ink hover:text-bg"
        >
          ← Prev
        </Link>
      ) : (
        <span className="rounded-full border border-ink/10 px-4 py-2 uppercase tracking-wider text-ink-subtle opacity-50">
          ← Prev
        </span>
      )}
      <span className="px-2 text-ink-muted">
        Page {page} / {totalPages}
      </span>
      {page < totalPages ? (
        <Link
          href={`${baseHref}${sep}page=${page + 1}`}
          className="rounded-full border border-ink/15 px-4 py-2 uppercase tracking-wider text-ink-muted hover:bg-ink hover:text-bg"
        >
          Next →
        </Link>
      ) : (
        <span className="rounded-full border border-ink/10 px-4 py-2 uppercase tracking-wider text-ink-subtle opacity-50">
          Next →
        </span>
      )}
    </div>
  );
}
