import { Router, type IRouter } from "express";
import healthRouter from "./health";
import childrenRouter from "./children";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/children", childrenRouter);

export default router;
