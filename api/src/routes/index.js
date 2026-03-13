import { Router } from "express";
import {
  classifyEntryController,
  createEntryController,
  listCategoriesController,
  listEntriesController,
  seedDemoController,
  statusController,
} from "../controllers/entries.controller.js";

const router = Router();

router.get("/status", statusController);
router.get("/entries", listEntriesController);
router.post("/entries", createEntryController);
router.get("/categories", listCategoriesController);
router.post("/classify", classifyEntryController);
router.post("/demo/seed", seedDemoController);

export default router;
