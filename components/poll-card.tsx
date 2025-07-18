'use client';

import { Poll } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface PollCardProps {
  poll: Poll;
}

export default function PollCard({ poll }: PollCardProps) {
  const router = useRouter();
  const isActive = !poll.closed && poll.votingEndsAt > new Date();
  const isEnded = poll.votingEndsAt <= new Date();

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl font-semibold text-slate-800">
            {poll.title}
          </CardTitle>
          <div className="flex flex-col gap-2">
            {poll.closed ? (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                <CheckCircle className="w-3 h-3 mr-1" />
                Closed
              </Badge>
            ) : isActive ? (
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                <Clock className="w-3 h-3 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                <Clock className="w-3 h-3 mr-1" />
                Ended
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-600 mb-2">Restaurant Options:</p>
            <div className="flex flex-wrap gap-2">
              {poll.restaurantOptions.map((restaurant, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={`${
                    poll.selectedRestaurant === restaurant 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  {restaurant}
                  {poll.selectedRestaurant === restaurant && (
                    <CheckCircle className="w-3 h-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{poll.restaurantOptions.length} options</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                {poll.votingEndsAt.toLocaleDateString()} at{' '}
                {poll.votingEndsAt.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => router.push(`/poll/${poll.id}`)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {isActive ? 'Vote Now' : poll.closed ? 'View Results' : 'View Poll'}
            </Button>
            {poll.closed && (
              <Button
                onClick={() => router.push(`/poll/${poll.id}/orders`)}
                variant="outline"
                className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
              >
                View Orders
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}