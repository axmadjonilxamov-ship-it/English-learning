import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/admin";
import { sql } from "@/lib/db";

/** Admin panel uchun barcha statistika. */
export async function GET() {
  const admin = await checkAdmin();
  if (!admin.ok) {
    // `locked` — hisob admin, lekin parol hali kiritilmagan.
    return NextResponse.json({ error: "Ruxsat yo'q", reason: admin.reason }, { status: 403 });
  }

  const [totals, users, devices, recent] = await Promise.all([
    sql`
      select
        (select count(*) from "user") as users,
        (select count(*) from session where "expiresAt" > now()) as active_sessions,
        (select count(*) from lesson_progress) as lessons_done,
        (select count(*) from violation) as violations,
        (select count(*) from device_block where forever) as banned_devices,
        (select count(*) from device_block where blocked_until > now()) as blocked_now`,
    sql`
      select u.id, u.name, u.email, u.role, u."createdAt" as created_at,
             count(lp.lesson_id) as lessons,
             coalesce(max(db.violations), 0) as violations,
             bool_or(db.forever) as banned,
             max(db.blocked_until) as blocked_until
      from "user" u
      left join lesson_progress lp on lp.user_id = u.id
      left join device_block db on db.user_id = u.id
      group by u.id, u.name, u.email, u.role, u."createdAt"
      order by u."createdAt" desc
      limit 200`,
    sql`
      select device_id, violations, blocked_until, forever, user_id, updated_at
      from device_block
      where violations > 0
      order by violations desc, updated_at desc
      limit 100`,
    sql`
      select v.kind, v.quiz_score, v.created_at, u.name
      from violation v
      left join "user" u on u.id = v.user_id
      order by v.created_at desc
      limit 50`,
  ]);

  return NextResponse.json({ totals: totals[0], users, devices, recent });
}

type Action = {
  action?: "block" | "unblock" | "ban" | "unban" | "make-admin" | "remove-admin";
  userId?: string;
  deviceId?: string;
  minutes?: number;
};

/** Foydalanuvchi yoki qurilmani bloklash / blokdan chiqarish. */
export async function POST(request: Request) {
  const admin = await checkAdmin();
  if (!admin.ok) return NextResponse.json({ error: "Ruxsat yo'q", reason: admin.reason }, { status: 403 });

  let body: Action;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  const { action, userId, deviceId } = body;
  const minutes = Math.max(1, Math.min(10_080, Math.round(Number(body.minutes) || 10)));

  switch (action) {
    case "block": {
      const until = new Date(Date.now() + minutes * 60_000).toISOString();
      if (deviceId) {
        await sql`
          insert into device_block (device_id, blocked_until)
          values (${deviceId}, ${until}::timestamptz)
          on conflict (device_id) do update set blocked_until = ${until}::timestamptz, updated_at = now()`;
      } else if (userId) {
        await sql`update device_block set blocked_until = ${until}::timestamptz, updated_at = now() where user_id = ${userId}`;
      }
      break;
    }
    case "unblock": {
      if (deviceId) {
        await sql`update device_block set blocked_until = null, forever = false, violations = 0, updated_at = now() where device_id = ${deviceId}`;
      } else if (userId) {
        await sql`update device_block set blocked_until = null, forever = false, violations = 0, updated_at = now() where user_id = ${userId}`;
      }
      break;
    }
    case "ban": {
      if (deviceId) {
        await sql`
          insert into device_block (device_id, forever) values (${deviceId}, true)
          on conflict (device_id) do update set forever = true, updated_at = now()`;
      } else if (userId) {
        await sql`update device_block set forever = true, updated_at = now() where user_id = ${userId}`;
      }
      break;
    }
    case "unban": {
      if (deviceId) await sql`update device_block set forever = false, updated_at = now() where device_id = ${deviceId}`;
      else if (userId) await sql`update device_block set forever = false, updated_at = now() where user_id = ${userId}`;
      break;
    }
    case "make-admin":
      if (userId) await sql`update "user" set role = 'admin' where id = ${userId}`;
      break;
    case "remove-admin":
      // Admin o'zini huquqdan mahrum qila olmaydi — panel egasiz qolmasin.
      if (userId && userId !== admin.id) await sql`update "user" set role = 'user' where id = ${userId}`;
      break;
    default:
      return NextResponse.json({ error: "Noma'lum amal" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
