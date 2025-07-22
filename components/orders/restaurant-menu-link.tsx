"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Edit, Save, X, Link } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RestaurantMenuLinkProps {
  restaurantName: string;
  menuUrl?: string;
  isAdmin: boolean;
  onUpdateMenuUrl?: (url: string) => Promise<void>;
}

export function RestaurantMenuLink({
  restaurantName,
  menuUrl,
  isAdmin,
  onUpdateMenuUrl,
}: RestaurantMenuLinkProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editUrl, setEditUrl] = useState(menuUrl || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!onUpdateMenuUrl) return;
    
    try {
      setSaving(true);
      await onUpdateMenuUrl(editUrl.trim());
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating menu URL:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditUrl(menuUrl || "");
    setIsEditing(false);
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (!menuUrl && !isAdmin) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Link className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="editing"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="space-y-3"
                >
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Link do menu - {restaurantName}
                    </label>
                    <Input
                      type="url"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      placeholder="https://przykład.com/menu"
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={saving || !editUrl.trim() || !isValidUrl(editUrl.trim())}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      {saving ? "Zapisywanie..." : "Zapisz"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Anuluj
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="viewing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  <div className="text-sm font-medium text-gray-800">
                    Menu - {restaurantName}
                  </div>
                  
                  {menuUrl ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="bg-white hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800"
                      >
                        <a
                          href={menuUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Otwórz menu
                        </a>
                      </Button>
                      
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edytuj
                        </Button>
                      )}
                    </div>
                  ) : (
                    isAdmin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Dodaj link do menu
                      </Button>
                    )
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
