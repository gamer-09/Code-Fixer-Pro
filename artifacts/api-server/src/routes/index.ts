import { Router, type IRouter } from "express";
import healthRouter from "./health";
import marketRouter from "./market";
import chatRouter from "./chat";
import newsRouter from "./news";
import earningsRouter from "./earnings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(marketRouter);
router.use(chatRouter);
router.use(newsRouter);
router.use(earningsRouter);

export default router;
