/**
 * Notifications router.
 * Acts as a thin proxy — validates query params, delegates to the service
 * layer, and returns the upstream response. Keeping business logic in the
 * service layer means this file only handles HTTP concerns.
 */
import { Router, Request, Response, NextFunction } from "express";
import { fetchNotifications } from "../services/notificationsService";
import { Log } from "../services/logger";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const page = req.query.page ? Number(req.query.page) : 1;
    const notification_type = req.query.notification_type as string | undefined;

    if (isNaN(limit) || isNaN(page) || limit < 1 || page < 1) {
      res.status(400).json({
        success: false,
        message: "limit and page must be positive integers.",
      });
      return;
    }

    Log(
      "backend",
      "debug",
      "controller",
      `GET /notifications limit=${limit} page=${page} type=${notification_type ?? "all"}`
    ).catch(() => {});

    const upstreamData = await fetchNotifications({ limit, page, notification_type });

    // Return a consistent envelope so the frontend always reads res.data.notifications
    res.json({
      success: true,
      data: {
        notifications: upstreamData.notifications ?? [],
        total: upstreamData.total ?? 0,
        page: upstreamData.page ?? page,
        limit: upstreamData.limit ?? limit,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
