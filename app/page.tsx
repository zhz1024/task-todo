import type { Metadata } from "next"
import TaskDashboard from "@/components/task-dashboard"

export const metadata: Metadata = {
  title: "任务流 - 现代任务管理",
  description: "一个设计精美的任务管理应用",
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <TaskDashboard />
    </div>
  )
}

