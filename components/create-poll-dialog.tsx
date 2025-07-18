'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { createPoll } from '@/lib/firestore';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const pollSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  restaurants: z.array(z.object({ name: z.string().min(1, 'Restaurant name is required') }))
    .min(2, 'At least 2 restaurants are required'),
  votingEndsAt: z.string().min(1, 'End date is required'),
});

type PollFormData = z.infer<typeof pollSchema>;

export default function CreatePollDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PollFormData>({
    resolver: zodResolver(pollSchema),
    defaultValues: {
      title: '',
      restaurants: [{ name: '' }, { name: '' }],
      votingEndsAt: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'restaurants',
  });

  const onSubmit = async (data: PollFormData) => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    try {
      const pollId = await createPoll({
        title: data.title,
        restaurantOptions: data.restaurants.map(r => r.name),
        createdBy: session.user.id,
        votingEndsAt: new Date(data.votingEndsAt),
        closed: false,
        selectedRestaurant: null,
      });

      setOpen(false);
      reset();
      router.refresh();
    } catch (error) {
      console.error('Error creating poll:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create Poll
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Poll</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Poll Title</Label>
            <Input
              id="title"
              placeholder="e.g., Lunch for Friday"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Restaurant Options</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: '' })}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Restaurant
              </Button>
            </div>
            
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <Input
                  placeholder={`Restaurant ${index + 1}`}
                  {...register(`restaurants.${index}.name`)}
                />
                {fields.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            
            {errors.restaurants && (
              <p className="text-sm text-red-600">{errors.restaurants.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="votingEndsAt">Voting Ends At</Label>
            <Input
              id="votingEndsAt"
              type="datetime-local"
              {...register('votingEndsAt')}
            />
            {errors.votingEndsAt && (
              <p className="text-sm text-red-600">{errors.votingEndsAt.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
            >
              {isLoading ? 'Creating...' : 'Create Poll'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}