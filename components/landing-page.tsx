"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Vote,
  Clock,
  Users,
  ChefHat,
  MessageSquare,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: <Vote className="w-8 h-8 text-blue-600" />,
      title: "Demokratyczne głosowanie",
      description:
        "Każdy w zespole może zagłosować na swoją ulubioną restaurację",
      gradient: "from-blue-50 to-indigo-50",
      border: "border-blue-200",
    },
    {
      icon: <ChefHat className="w-8 h-8 text-green-600" />,
      title: "Łatwe zamawianie",
      description: "Po wyborze restauracji wszyscy mogą dodać swoje zamówienia",
      gradient: "from-green-50 to-emerald-50",
      border: "border-green-200",
    },
    {
      icon: <Clock className="w-8 h-8 text-orange-600" />,
      title: "Aktualizacje na żywo",
      description:
        "Zobacz wyniki głosowania i status zamówień w czasie rzeczywistym",
      gradient: "from-orange-50 to-amber-50",
      border: "border-orange-200",
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-purple-600" />,
      title: "Przejrzyste wyniki",
      description: "Dokładne wyniki głosowania z podsumowaniem zamówień",
      gradient: "from-purple-50 to-violet-50",
      border: "border-purple-200",
    },
    {
      icon: <Users className="w-8 h-8 text-teal-600" />,
      title: "Zespołowa współpraca",
      description: "Wszyscy członkowie zespołu mogą uczestniczyć w procesie",
      gradient: "from-teal-50 to-cyan-50",
      border: "border-teal-200",
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: "Bezpieczne dane",
      description:
        "Twoje dane są chronione i dostępne tylko dla członków zespołu",
      gradient: "from-red-50 to-pink-50",
      border: "border-red-200",
    },
  ];

  const steps = [
    {
      number: "1",
      title: "Administrator tworzy głosowanie",
      description: "Ustawia dostępne restauracje i czas trwania głosowania",
    },
    {
      number: "2",
      title: "Zespół głosuje",
      description:
        "Każdy członek zespołu wybiera swoją preferowaną restaurację",
    },
    {
      number: "3",
      title: "Wyniki są podliczane",
      description:
        "Automatyczne podsumowanie głosów i wybór zwycięskiej restauracji",
    },
    {
      number: "4",
      title: "Składanie zamówień",
      description:
        "Członkowie zespołu dodają swoje zamówienia z wybranej restauracji",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
        <div className="relative px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8 sm:py-24">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="mb-6 text-5xl font-bold sm:text-6xl text-slate-900">
              <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                EasyFood
              </span>
              <br />
              <span className="text-4xl text-slate-700 sm:text-5xl">
                Zespołowe zamawianie jedzenia
              </span>
            </h1>
            <p className="max-w-3xl mx-auto mb-8 text-xl text-slate-600">
              Uprość proces zamawiania jedzenia w swojej firmie. Głosujcie razem
              na restauracje, składajcie zamówienia i cieszczcie się wspólnymi
              posiłkami.
            </p>
            <div className="flex flex-col justify-center sm:flex-row gap-4">
              <Button
                size="lg"
                className="px-8 py-4 text-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => router.push("/auth/signin")}
              >
                Zacznij już teraz
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg border-slate-300 hover:bg-slate-50"
              >
                Zobacz jak to działa
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl text-slate-900">
              Dlaczego warto wybrać EasyFood?
            </h2>
            <p className="max-w-2xl mx-auto text-xl text-slate-600">
              Odkryj funkcje, które czynią zamawianie jedzenia w zespole prostym
              i przyjemnym
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  className={`bg-gradient-to-br ${feature.gradient} ${feature.border} h-full hover:shadow-lg transition-all duration-300 hover:scale-105`}
                >
                  <CardContent className="p-6">
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="mb-3 text-lg font-semibold text-slate-800">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl text-slate-900">
              Jak to działa?
            </h2>
            <p className="max-w-2xl mx-auto text-xl text-slate-600">
              Prosty proces w czterech krokach
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-2xl font-bold text-white rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                  {step.number}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="text-slate-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="items-center grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="mb-6 text-3xl font-bold sm:text-4xl text-slate-900">
                Oszczędzaj czas i unikaj problemów
              </h2>
              <p className="mb-8 text-lg text-slate-600">
                EasyFood rozwiązuje typowe problemy związane z zamawianiem
                jedzenia w zespole
              </p>

              <div className="space-y-4">
                {[
                  "Koniec z długimi dyskusjami o tym, gdzie zamówić",
                  "Automatyczne zbieranie zamówień od wszystkich",
                  "Przejrzyste podsumowanie kosztów i zamówień",
                  "Historia wszystkich głosowań i zamówień",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="flex-shrink-0 w-6 h-6 text-green-600" />
                    <span className="text-slate-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="p-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl">
                <div className="p-6 bg-white shadow-lg rounded-xl">
                  <div className="flex items-center mb-4 gap-3">
                    <Zap className="w-8 h-8 text-yellow-500" />
                    <h3 className="text-xl font-semibold text-slate-900">
                      Szybkie efekty
                    </h3>
                  </div>
                  <p className="mb-4 text-slate-600">
                    Zespoły używające EasyFood oszczędzają średnio 15 minut
                    dziennie na organizację zamawiania jedzenia.
                  </p>
                  <div className="text-3xl font-bold text-blue-600">
                    ~75h rocznie
                  </div>
                  <div className="text-sm text-slate-500">
                    zaoszczędzonego czasu na zespół
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-white bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="max-w-4xl px-4 mx-auto text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold sm:text-4xl">
            Gotowy na rozpoczęcie?
          </h2>
          <p className="mb-8 text-xl text-blue-100">
            Dołącz do zespołów, które już uprościły swoje zamawianie jedzenia
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="px-8 py-4 text-lg font-semibold text-blue-600 bg-white hover:bg-blue-50"
            onClick={() => router.push("/auth/signin")}
          >
            Zaloguj się i zacznij
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
}
