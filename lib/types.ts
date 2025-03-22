export interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  important: boolean
  categoryId: string | null
  dueDate: string | null
  createdAt: string
}

export interface Category {
  id: string
  name: string
  color: string
}

