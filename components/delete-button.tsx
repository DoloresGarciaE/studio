"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Result = { error?: string; success?: boolean }

interface DeleteButtonProps {
  // Acepta tanto action() (closure que ya conoce el id) como action(id).
  action(id?: string): Promise<Result>
  id?: string
  title?: string
  label?: string
  description?: string
  successMessage?: string
}

export function DeleteButton({
  action,
  id,
  title,
  label,
  description,
  successMessage,
}: DeleteButtonProps) {
  const [pending, startTransition] = useTransition()
  const heading = title ?? label ?? "¿Eliminar?"

  function onConfirm() {
    startTransition(async () => {
      const res = await action(id)
      if (res?.error) {
        toast.error(res.error)
        return
      }
      toast.success(successMessage ?? "Eliminado")
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={heading}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{heading}</AlertDialogTitle>
          {description ? (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={pending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
