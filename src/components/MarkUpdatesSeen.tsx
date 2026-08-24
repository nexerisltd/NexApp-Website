"use client";

import { useEffect } from "react";
import { markUpdatesSeen } from "@/app/updates/actions";

export default function MarkUpdatesSeen() {
  useEffect(() => {
    markUpdatesSeen();
  }, []);
  return null;
}
