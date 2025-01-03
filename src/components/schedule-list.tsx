'use client';

import { useSchedules } from '@/hooks/use-schedules';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Skeleton } from './ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { Trash2, ArrowRight } from 'lucide-react';

export function ScheduleList() {
  const { schedules = [], isLoading, deleteSchedule } = useSchedules();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-3 w-1/4" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!schedules?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No schedules found</CardTitle>
          <CardDescription>Create a new schedule to get started.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {schedules.map((schedule: any) => (
        <Card key={schedule.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{schedule.name}</CardTitle>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this schedule? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        deleteSchedule(schedule.id);
                        router.refresh();
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <CardDescription>{schedule.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted p-4">
              <div className="text-sm text-muted-foreground">
                <div className="mb-2">
                  <strong>Total Courses:</strong> {schedule.data?.courses?.length || 0}
                </div>
                <div className="mb-2">
                  <strong>Total Faculty:</strong> {schedule.data?.faculty?.length || 0}
                </div>
                <div>
                  <strong>Total Rooms:</strong> {schedule.data?.rooms?.length || 0}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Created {formatDistanceToNow(new Date(schedule.createdAt))} ago
            </span>
            <Button 
              onClick={() => router.push(`/schedules/${schedule.id}`)}
              size="sm"
              className="gap-2"
            >
              View Details
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 