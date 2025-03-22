"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Task } from "@/lib/types"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface CalendarViewProps {
  tasks: Task[]
  onSelectDate: (date: Date | null) => void
  selectedDate: Date | null
  mini?: boolean
}

export default function CalendarView({ tasks, onSelectDate, selectedDate, mini = false }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentView, setCurrentView] = useState<"month" | "week">("month")

  // 获取当前月份的第一天
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

  // 获取当前月份的天数
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()

  // 获取当前月份第一天是星期几（0-6，0是星期日）
  const firstDayOfWeek = firstDayOfMonth.getDay()

  // 生成日历网格
  const calendarDays = []

  // 添加上个月的剩余天数
  const prevMonthDays = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({
      date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthDays - i),
      isCurrentMonth: false,
    })
  }

  // 添加当前月份的天数
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i),
      isCurrentMonth: true,
    })
  }

  // 添加下个月的开始几天，使日历网格填满
  const remainingDays = 42 - calendarDays.length // 6行7列 = 42
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({
      date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i),
      isCurrentMonth: false,
    })
  }

  // 检查日期是否有任务
  const hasTasksOnDate = (date: Date) => {
    const dateString = date.toDateString()
    return tasks.some((task) => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate)
      return taskDate.toDateString() === dateString
    })
  }

  // 获取日期上的任务数量
  const getTaskCountOnDate = (date: Date) => {
    const dateString = date.toDateString()
    return tasks.filter((task) => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate)
      return taskDate.toDateString() === dateString
    }).length
  }

  // 检查日期是否是今天
  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // 检查日期是否被选中
  const isSelected = (date: Date) => {
    if (!selectedDate) return false
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }

  // 前一个月
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  // 下一个月
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  // 返回今天
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // 格式化月份和年份
  const formatMonthYear = () => {
    return currentDate.toLocaleDateString("zh-CN", { year: "numeric", month: "long" })
  }

  // 星期几的标签
  const weekDays = ["一", "二", "三", "四", "五", "六", "日"]

  return (
    <div className={cn("w-full", mini ? "text-sm" : "")}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={prevMonth} className={cn(mini ? "h-7 w-7" : "")}>
            <ChevronLeft className={cn("h-4 w-4", mini ? "h-3 w-3" : "")} />
          </Button>
          <h3 className={cn("font-medium", mini ? "text-sm" : "text-lg")}>{formatMonthYear()}</h3>
          <Button variant="ghost" size="icon" onClick={nextMonth} className={cn(mini ? "h-7 w-7" : "")}>
            <ChevronRight className={cn("h-4 w-4", mini ? "h-3 w-3" : "")} />
          </Button>
        </div>
        {!mini && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              今天
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentView(currentView === "month" ? "week" : "month")}
            >
              {currentView === "month" ? "周视图" : "月视图"}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className={cn("text-center font-medium text-muted-foreground", mini ? "text-xs py-1" : "py-2")}
          >
            {day}
          </div>
        ))}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentDate.getMonth() + "-" + currentDate.getFullYear()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="col-span-7 grid grid-cols-7 gap-1"
          >
            {calendarDays.map((day, index) => {
              const hasTask = hasTasksOnDate(day.date)
              const taskCount = getTaskCountOnDate(day.date)

              return (
                <div
                  key={index}
                  className={cn(
                    "relative flex flex-col items-center justify-center",
                    mini ? "h-7" : "h-16 sm:h-24",
                    day.isCurrentMonth ? "bg-card" : "bg-muted/50",
                    isSelected(day.date) && "bg-primary/10 border border-primary",
                    isToday(day.date) && !isSelected(day.date) && "border border-primary/50",
                    "rounded-md cursor-pointer hover:bg-muted transition-colors",
                  )}
                  onClick={() => onSelectDate(day.date)}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center",
                      mini ? "h-7 w-7 text-xs" : "h-8 w-8",
                      isToday(day.date) && "bg-primary text-primary-foreground rounded-full",
                    )}
                  >
                    {day.date.getDate()}
                  </div>

                  {!mini && hasTask && (
                    <div className="absolute bottom-1 flex items-center justify-center">
                      <div
                        className={cn(
                          "text-xs font-medium px-1.5 py-0.5 rounded-full",
                          taskCount > 0 && "bg-primary/20 text-primary",
                        )}
                      >
                        {taskCount}
                      </div>
                    </div>
                  )}

                  {mini && hasTask && <div className="absolute bottom-0.5 h-1 w-1 rounded-full bg-primary" />}
                </div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

