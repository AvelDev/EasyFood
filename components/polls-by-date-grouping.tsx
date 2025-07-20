"use client";

import { useState, useMemo } from "react";
import { Poll } from "@/types";
import PollCard from "./poll-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronDown, ChevronRight, Archive } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface PollsByDateGroupingProps {
  polls: Poll[];
  onPollDeleted?: () => void;
}

type GroupedPolls = {
  [key: string]: {
    polls: Poll[];
    date: Date;
    isToday: boolean;
    isFuture: boolean;
    isPast: boolean;
  };
};

export default function PollsByDateGrouping({
  polls,
  onPollDeleted,
}: PollsByDateGroupingProps) {
  const [expandedArchive, setExpandedArchive] = useState(false);
  const [expandedFuture, setExpandedFuture] = useState(false);

  const groupedPolls = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const grouped: GroupedPolls = {};

    polls.forEach((poll) => {
      const pollDate = new Date(poll.votingEndsAt);
      pollDate.setHours(0, 0, 0, 0);

      const dateKey = pollDate.toISOString().split("T")[0];

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          polls: [],
          date: pollDate,
          isToday: pollDate.getTime() === today.getTime(),
          isFuture: pollDate.getTime() > today.getTime(),
          isPast: pollDate.getTime() < today.getTime(),
        };
      }

      grouped[dateKey].polls.push(poll);
    });

    // Sortuj każdą grupę według czasu końca głosowania (najnowsze najpierw)
    Object.values(grouped).forEach((group) => {
      group.polls.sort(
        (a, b) =>
          new Date(b.votingEndsAt).getTime() -
          new Date(a.votingEndsAt).getTime()
      );
    });

    return grouped;
  }, [polls]);

  const sortedDateKeys = useMemo(() => {
    return Object.keys(groupedPolls).sort((a, b) => {
      const groupA = groupedPolls[a];
      const groupB = groupedPolls[b];

      // Dzisiejsze głosowania zawsze na początku
      if (groupA.isToday && !groupB.isToday) return -1;
      if (!groupA.isToday && groupB.isToday) return 1;

      // Przyszłe daty sortowane chronologicznie (najwcześniejsze najpierw)
      if (groupA.isFuture && groupB.isFuture) {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateA.getTime() - dateB.getTime();
      }

      // Przeszłe daty sortowane odwrotnie chronologicznie (najnowsze najpierw)
      if (groupA.isPast && groupB.isPast) {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateB.getTime() - dateA.getTime();
      }

      // Przyszłe przed przeszłymi
      if (groupA.isFuture && groupB.isPast) return -1;
      if (groupA.isPast && groupB.isFuture) return 1;

      // Fallback dla innych przypadków
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });
  }, [groupedPolls]);

  // Dzisiejsze głosowania
  const todayKeys = sortedDateKeys.filter((key) => groupedPolls[key].isToday);

  // Przyszłe głosowania podzielone na najbliższe 7 dni i dalsze
  const futureKeys = sortedDateKeys.filter((key) => groupedPolls[key].isFuture);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(today.getDate() + 7);

  const next7DaysKeys = futureKeys.filter((key) => {
    const date = new Date(key);
    return date <= sevenDaysLater;
  });

  const laterFutureKeys = futureKeys.filter((key) => {
    const date = new Date(key);
    return date > sevenDaysLater;
  });

  // Przeszłe głosowania
  const pastKeys = sortedDateKeys.filter((key) => groupedPolls[key].isPast);

  const formatDateHeader = (
    date: Date,
    isToday: boolean,
    isFuture: boolean
  ) => {
    if (isToday) {
      return "Dzisiaj";
    }

    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    const formattedDate = date.toLocaleDateString("pl-PL", options);

    if (isFuture) {
      return formattedDate;
    }

    return formattedDate;
  };

  const getTodayStyle = (isToday: boolean) => {
    if (isToday) {
      return "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg";
    }
    return "bg-white/80 border-slate-200";
  };

  return (
    <div className="space-y-6">
      {/* Dzisiejsze głosowania */}
      <AnimatePresence>
        {todayKeys.map((dateKey) => {
          const group = groupedPolls[dateKey];
          return (
            <motion.div
              key={dateKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className={`${getTodayStyle(group.isToday)} backdrop-blur-sm`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <CardTitle className="text-xl text-blue-800">
                        {formatDateHeader(
                          group.date,
                          group.isToday,
                          group.isFuture
                        )}
                      </CardTitle>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Aktywne
                      </Badge>
                    </div>
                    <Badge variant="outline">
                      {group.polls.length}{" "}
                      {group.polls.length === 1 ? "głosowanie" : "głosowań"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <motion.div
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <AnimatePresence>
                      {group.polls.map((poll, index) => (
                        <motion.div
                          key={poll.id}
                          initial={{ opacity: 0, y: 20, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -20, scale: 0.9 }}
                          transition={{
                            delay: index * 0.05,
                            duration: 0.2,
                            type: "spring",
                            stiffness: 300,
                          }}
                          layout
                        >
                          <PollCard poll={poll} onPollDeleted={onPollDeleted} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Następne 7 dni */}
      <AnimatePresence>
        {next7DaysKeys.map((dateKey) => {
          const group = groupedPolls[dateKey];
          return (
            <motion.div
              key={dateKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/80 border-slate-200 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-slate-600" />
                      <CardTitle className="text-xl text-slate-800">
                        {formatDateHeader(
                          group.date,
                          group.isToday,
                          group.isFuture
                        )}
                      </CardTitle>
                    </div>
                    <Badge variant="outline">
                      {group.polls.length}{" "}
                      {group.polls.length === 1 ? "głosowanie" : "głosowań"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <motion.div
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <AnimatePresence>
                      {group.polls.map((poll, index) => (
                        <motion.div
                          key={poll.id}
                          initial={{ opacity: 0, y: 20, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -20, scale: 0.9 }}
                          transition={{
                            delay: index * 0.05,
                            duration: 0.2,
                            type: "spring",
                            stiffness: 300,
                          }}
                          layout
                        >
                          <PollCard poll={poll} onPollDeleted={onPollDeleted} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Późniejsze przyszłe głosowania - zwijane */}
      {laterFutureKeys.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Collapsible open={expandedFuture} onOpenChange={setExpandedFuture}>
            <Card className="bg-green-50/80 border-green-200 backdrop-blur-sm">
              <CollapsibleTrigger asChild>
                <CardHeader className="pb-4 cursor-pointer hover:bg-green-100/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <CardTitle className="text-xl text-green-800">
                        Późniejsze głosowania
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className="bg-green-200 text-green-800"
                      >
                        {laterFutureKeys.reduce(
                          (total, key) =>
                            total + groupedPolls[key].polls.length,
                          0
                        )}{" "}
                        głosowań
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-700"
                      >
                        {expandedFuture ? (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" />
                            Zwiń
                          </>
                        ) : (
                          <>
                            <ChevronRight className="w-4 h-4 mr-1" />
                            Rozwiń
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-6">
                    <AnimatePresence>
                      {laterFutureKeys.map((dateKey) => {
                        const group = groupedPolls[dateKey];
                        return (
                          <motion.div
                            key={`future-${dateKey}`}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-l-2 border-green-200 pl-4"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <Calendar className="w-4 h-4 text-green-600" />
                              <h3 className="text-lg font-medium text-green-800">
                                {formatDateHeader(group.date, false, true)}
                              </h3>
                              <Badge
                                variant="outline"
                                className="text-xs border-green-300 text-green-700"
                              >
                                {group.polls.length}{" "}
                                {group.polls.length === 1
                                  ? "głosowanie"
                                  : "głosowań"}
                              </Badge>
                            </div>

                            <motion.div
                              className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              {group.polls.map((poll, index) => (
                                <motion.div
                                  key={poll.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    delay: index * 0.03,
                                    duration: 0.2,
                                  }}
                                >
                                  <PollCard
                                    poll={poll}
                                    onPollDeleted={onPollDeleted}
                                  />
                                </motion.div>
                              ))}
                            </motion.div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </motion.div>
      )}

      {/* Archiwum - starsze głosowania */}
      {pastKeys.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Collapsible open={expandedArchive} onOpenChange={setExpandedArchive}>
            <Card className="bg-slate-50/80 border-slate-200 backdrop-blur-sm">
              <CollapsibleTrigger asChild>
                <CardHeader className="pb-4 cursor-pointer hover:bg-slate-100/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Archive className="w-5 h-5 text-slate-500" />
                      <CardTitle className="text-xl text-slate-700">
                        Archiwum głosowań
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className="bg-slate-200 text-slate-700"
                      >
                        {pastKeys.reduce(
                          (total, key) =>
                            total + groupedPolls[key].polls.length,
                          0
                        )}{" "}
                        głosowań
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-600"
                      >
                        {expandedArchive ? (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" />
                            Zwiń
                          </>
                        ) : (
                          <>
                            <ChevronRight className="w-4 h-4 mr-1" />
                            Rozwiń
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-6">
                    <AnimatePresence>
                      {pastKeys.map((dateKey) => {
                        const group = groupedPolls[dateKey];
                        return (
                          <motion.div
                            key={`archive-${dateKey}`}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-l-2 border-slate-200 pl-4"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <Calendar className="w-4 h-4 text-slate-500" />
                              <h3 className="text-lg font-medium text-slate-700">
                                {formatDateHeader(group.date, false, false)}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {group.polls.length}{" "}
                                {group.polls.length === 1
                                  ? "głosowanie"
                                  : "głosowań"}
                              </Badge>
                            </div>

                            <motion.div
                              className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              {group.polls.map((poll, index) => (
                                <motion.div
                                  key={poll.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    delay: index * 0.03,
                                    duration: 0.2,
                                  }}
                                >
                                  <div className="opacity-80 hover:opacity-100 transition-opacity">
                                    <PollCard
                                      poll={poll}
                                      onPollDeleted={onPollDeleted}
                                    />
                                  </div>
                                </motion.div>
                              ))}
                            </motion.div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </motion.div>
      )}

      {/* Gdy brak głosowań */}
      {sortedDateKeys.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center py-12"
        >
          <Calendar className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <h2 className="text-2xl font-semibold text-slate-600 mb-2">
            Brak głosowań
          </h2>
          <p className="text-slate-500">
            Nie ma jeszcze żadnych głosowań do wyświetlenia.
          </p>
        </motion.div>
      )}
    </div>
  );
}
