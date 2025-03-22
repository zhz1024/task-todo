"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CalendarIcon, CheckCircle2, Filter, LayoutGrid, List, Plus, Search, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import TaskItem from "@/components/task-item"
import TaskForm from "@/components/task-form"
import CalendarView from "@/components/calendar-view"
import type { Task, Category } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function TaskDashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [categories, setCategories] = useState<Category[]>([
    { id: "1", name: "工作", color: "bg-blue-500" },
    { id: "2", name: "个人", color: "bg-green-500" },
    { id: "3", name: "购物", color: "bg-amber-500" },
    { id: "4", name: "健康", color: "bg-rose-500" },
    { id: "5", name: "学习", color: "bg-purple-500" },
    { id: "6", name: "娱乐", color: "bg-pink-500" },
  ])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [activeView, setActiveView] = useState<"tasks" | "calendar">("tasks")

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks")
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [])

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks))
  }, [tasks])

  // Filter tasks based on search query, active filter, and selected date
  useEffect(() => {
    let result = [...tasks]

    if (searchQuery) {
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (activeFilter) {
      if (activeFilter === "completed") {
        result = result.filter((task) => task.completed)
      } else if (activeFilter === "important") {
        result = result.filter((task) => task.important)
      } else if (activeFilter === "today") {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        result = result.filter((task) => {
          if (!task.dueDate) return false
          const taskDate = new Date(task.dueDate)
          taskDate.setHours(0, 0, 0, 0)
          return taskDate.getTime() === today.getTime()
        })
      } else {
        // Filter by category
        result = result.filter((task) => task.categoryId === activeFilter)
      }
    }

    if (selectedDate) {
      const selected = new Date(selectedDate)
      selected.setHours(0, 0, 0, 0)
      result = result.filter((task) => {
        if (!task.dueDate) return false
        const taskDate = new Date(task.dueDate)
        taskDate.setHours(0, 0, 0, 0)
        return taskDate.getTime() === selected.getTime()
      })
    }

    setFilteredTasks(result)
  }, [tasks, searchQuery, activeFilter, selectedDate])

  const addTask = (task: Task) => {
    setTasks((prev) => [task, ...prev])
    setIsFormOpen(false)
  }

  const updateTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const toggleTaskCompletion = (id: string) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const toggleTaskImportance = (id: string) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, important: !task.important } : task)))
  }

  const getCategoryById = (id: string | null) => {
    if (!id) return null
    return categories.find((category) => category.id === id) || null
  }

  const getTaskCountByFilter = (filter: string) => {
    if (filter === "completed") {
      return tasks.filter((task) => task.completed).length
    } else if (filter === "important") {
      return tasks.filter((task) => task.important).length
    } else if (filter === "today") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return tasks.filter((task) => {
        if (!task.dueDate) return false
        const taskDate = new Date(task.dueDate)
        taskDate.setHours(0, 0, 0, 0)
        return taskDate.getTime() === today.getTime()
      }).length
    } else {
      return tasks.filter((task) => task.categoryId === filter).length
    }
  }

  const handleDateSelect = (date: Date | null) => {
    setSelectedDate(date)
    if (date) {
      setActiveView("tasks")
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            任务流
          </h1>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setActiveView(activeView === "tasks" ? "calendar" : "tasks")}
              variant="ghost"
              size="icon"
              className="rounded-full"
            >
              {activeView === "tasks" ? <CalendarIcon className="h-5 w-5" /> : <List className="h-5 w-5" />}
            </Button>
            <Button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              variant="ghost"
              size="icon"
              className="rounded-full"
            >
              {viewMode === "grid" ? <List className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
            </Button>
            <Button onClick={() => setIsFormOpen(true)} className="rounded-full">
              <Plus className="h-5 w-5 mr-1" /> 添加任务
            </Button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="搜索任务..."
              className="pl-10 rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-full">
                <Filter className="h-4 w-4 mr-2" /> 筛选
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setActiveFilter(null)}>所有任务</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveFilter("completed")}>已完成</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveFilter("important")}>重要</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveFilter("today")}>今日到期</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card rounded-xl p-4 shadow-sm">
            <h2 className="font-semibold mb-3 text-lg">筛选器</h2>
            <div className="space-y-1">
              <Button
                variant={activeFilter === null && !selectedDate ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveFilter(null)
                  setSelectedDate(null)
                }}
              >
                <LayoutGrid className="h-4 w-4 mr-2" /> 所有任务
                <Badge className="ml-auto">{tasks.length}</Badge>
              </Button>
              <Button
                variant={activeFilter === "today" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveFilter("today")
                  setSelectedDate(null)
                }}
              >
                <CalendarIcon className="h-4 w-4 mr-2" /> 今日
                <Badge className="ml-auto">{getTaskCountByFilter("today")}</Badge>
              </Button>
              <Button
                variant={activeFilter === "important" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveFilter("important")
                  setSelectedDate(null)
                }}
              >
                <Star className="h-4 w-4 mr-2" /> 重要
                <Badge className="ml-auto">{getTaskCountByFilter("important")}</Badge>
              </Button>
              <Button
                variant={activeFilter === "completed" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveFilter("completed")
                  setSelectedDate(null)
                }}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" /> 已完成
                <Badge className="ml-auto">{getTaskCountByFilter("completed")}</Badge>
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 shadow-sm">
            <h2 className="font-semibold mb-3 text-lg">分类</h2>
            <div className="space-y-1">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeFilter === category.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveFilter(category.id)
                    setSelectedDate(null)
                  }}
                >
                  <div className={cn("h-3 w-3 rounded-full mr-2", category.color)} />
                  {category.name}
                  <Badge className="ml-auto">{getTaskCountByFilter(category.id)}</Badge>
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 shadow-sm">
            <h2 className="font-semibold mb-3 text-lg">迷你日历</h2>
            <div className="p-1">
              <CalendarView tasks={tasks} onSelectDate={handleDateSelect} selectedDate={selectedDate} mini={true} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {activeView === "tasks" ? (
            <>
              {selectedDate && (
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    {selectedDate.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedDate(null)}>
                    清除日期
                  </Button>
                </div>
              )}
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">全部</TabsTrigger>
                  <TabsTrigger value="pending">待办</TabsTrigger>
                  <TabsTrigger value="completed">已完成</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-0">
                  <TaskList
                    tasks={filteredTasks}
                    viewMode={viewMode}
                    categories={categories}
                    onToggleComplete={toggleTaskCompletion}
                    onToggleImportant={toggleTaskImportance}
                    onDelete={deleteTask}
                    onUpdate={updateTask}
                  />
                </TabsContent>
                <TabsContent value="pending" className="mt-0">
                  <TaskList
                    tasks={filteredTasks.filter((task) => !task.completed)}
                    viewMode={viewMode}
                    categories={categories}
                    onToggleComplete={toggleTaskCompletion}
                    onToggleImportant={toggleTaskImportance}
                    onDelete={deleteTask}
                    onUpdate={updateTask}
                  />
                </TabsContent>
                <TabsContent value="completed" className="mt-0">
                  <TaskList
                    tasks={filteredTasks.filter((task) => task.completed)}
                    viewMode={viewMode}
                    categories={categories}
                    onToggleComplete={toggleTaskCompletion}
                    onToggleImportant={toggleTaskImportance}
                    onDelete={deleteTask}
                    onUpdate={updateTask}
                  />
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">日历视图</h2>
              <CalendarView tasks={tasks} onSelectDate={handleDateSelect} selectedDate={selectedDate} mini={false} />
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-xl shadow-lg w-full max-w-md"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">添加新任务</h2>
                <TaskForm
                  onSubmit={addTask}
                  onCancel={() => setIsFormOpen(false)}
                  categories={categories}
                  initialDate={selectedDate}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function TaskList({
  tasks,
  viewMode,
  categories,
  onToggleComplete,
  onToggleImportant,
  onDelete,
  onUpdate,
}: {
  tasks: Task[]
  viewMode: "grid" | "list"
  categories: Category[]
  onToggleComplete: (id: string) => void
  onToggleImportant: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (task: Task) => void
}) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-muted rounded-full p-3 mb-4">
          <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-medium mb-1">没有找到任务</h3>
        <p className="text-muted-foreground">添加新任务或更改筛选条件</p>
      </div>
    )
  }

  return (
    <div className={cn("grid gap-4", viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}>
      <AnimatePresence initial={false}>
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <TaskItem
              task={task}
              category={categories.find((c) => c.id === task.categoryId) || null}
              onToggleComplete={() => onToggleComplete(task.id)}
              onToggleImportant={() => onToggleImportant(task.id)}
              onDelete={() => onDelete(task.id)}
              onUpdate={onUpdate}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

