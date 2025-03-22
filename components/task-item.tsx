"use client"

import { useState } from "react"
import { CheckCircle, Circle, Clock, Edit, MoreHorizontal, Star, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Task, Category } from "@/lib/types"
import { cn } from "@/lib/utils"
import TaskForm from "@/components/task-form"

interface TaskItemProps {
  task: Task
  category: Category | null
  onToggleComplete: () => void
  onToggleImportant: () => void
  onDelete: () => void
  onUpdate: (task: Task) => void
}

export default function TaskItem({
  task,
  category,
  onToggleComplete,
  onToggleImportant,
  onDelete,
  onUpdate,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  const isOverdue = () => {
    if (!task.dueDate) return false
    const now = new Date()
    const dueDate = new Date(task.dueDate)
    return !task.completed && dueDate < now
  }

  if (isEditing) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">编辑任务</h3>
          <TaskForm
            task={task}
            onSubmit={(updatedTask) => {
              onUpdate(updatedTask)
              setIsEditing(false)
            }}
            onCancel={() => setIsEditing(false)}
            categories={[]} // This will be passed from parent
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all border-l-4",
        task.completed
          ? "opacity-80 border-l-green-500"
          : task.important
            ? "border-l-amber-500"
            : isOverdue()
              ? "border-l-red-500"
              : "border-l-transparent",
      )}
    >
      <CardContent className="p-0">
        <div className="flex items-start p-4 gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-6 w-6 shrink-0 mt-0.5"
            onClick={onToggleComplete}
          >
            {task.completed ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className={cn("font-medium line-clamp-2", task.completed && "line-through text-muted-foreground")}>
                {task.title}
              </h3>
              <div className="flex items-center shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onToggleImportant}>
                  <Star
                    className={cn(
                      "h-4 w-4",
                      task.important ? "fill-amber-400 text-amber-400" : "text-muted-foreground",
                    )}
                  />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" /> 编辑
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDelete} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" /> 删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {task.description && (
              <p className={cn("text-sm text-muted-foreground mt-1 line-clamp-2", task.completed && "line-through")}>
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-3">
              {category && (
                <Badge variant="outline" className="rounded-full">
                  <div className={cn("h-2 w-2 rounded-full mr-1", category.color)} />
                  {category.name}
                </Badge>
              )}

              {task.dueDate && (
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-full flex items-center gap-1",
                    isOverdue() && "border-destructive text-destructive",
                  )}
                >
                  <Clock className="h-3 w-3" />
                  {formatDate(task.dueDate)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

