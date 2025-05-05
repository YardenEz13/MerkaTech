import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getDatabase, ref, push, get } from 'firebase/database';
import { format } from 'date-fns';
import he from 'date-fns/locale/he';

export const IncidentReport = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    description: '',
    detailedDescription: '',
    location: '',
  });
  const [latestImage, setLatestImage] = useState(null);

  useEffect(() => {
    const fetchLatestImage = async () => {
      if (isOpen) {
        try {
          const db = getDatabase();
          const latestPhotoRef = ref(db, 'photos/latest/photo');
          const snapshot = await get(latestPhotoRef);
          if (snapshot.exists()) {
            setLatestImage(snapshot.val());
            console.log("Latest image fetched:", snapshot.val());
          }
        } catch (error) {
          console.error('Error fetching latest image:', error);
        }
      }
    };

    fetchLatestImage();
  }, [isOpen]);

  const formatHebrewDate = (date) => {
    try {
      const day = format(date, 'd', { locale: he });
      const month = format(date, 'MMMM', { locale: he });
      const year = format(date, 'yyyy', { locale: he });
      const time = format(date, 'HH:mm', { locale: he });
      return `${day} ב${month} ${year} בשעה ${time}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return date.toLocaleString('he-IL', { 
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const db = getDatabase();
    const timestamp = new Date();
    const incidentData = {
      alt: "Tank Image",
      description: formData.description,
      detailedDescription: formData.detailedDescription,
      imageUrl:  latestImage, 
      location: formData.location,
      status: "מבצע הושלם בהצלחה",
      timestamp: formatHebrewDate(timestamp),
    };

    try {
      await push(ref(db, 'history'), incidentData);
      onClose();
      setFormData({
        description: '',
        detailedDescription: '',
        location: '',
      });
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-slate-900 border border-slate-800 rounded-lg shadow-2xl">
        <DialogHeader className="border-b border-slate-800 pb-4">
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 012-2h8a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V3zm6 1a1 1 0 10-2 0v8a1 1 0 102 0V4zm4 3a1 1 0 00-2 0v5a1 1 0 102 0V7z" clipRule="evenodd" />
            </svg>
            דיווח אירוע
          </DialogTitle>
          <DialogDescription className="text-slate-400 mt-2">
            מלא את הפרטים הבאים כדי ליצור דיווח אירוע חדש
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {latestImage && (
            <div className="w-full aspect-video overflow-hidden rounded-lg border border-slate-700">
              <img 
                src={"data:image/jpeg;base64,"+latestImage} 
                alt="Incident" 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium text-slate-300">
              תיאור קצר
            </label>
            <Input
              id="description"
              name="description"
              placeholder="תיאור קצר"
              value={formData.description}
              onChange={handleChange}
              required
              dir="rtl"
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="detailedDescription" className="text-sm font-medium text-slate-300">
              תיאור מפורט
            </label>
            <Textarea
              id="detailedDescription"
              name="detailedDescription"
              placeholder="תיאור מפורט"
              value={formData.detailedDescription}
              onChange={handleChange}
              required
              dir="rtl"
              rows={4}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 min-h-[100px]"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="location" className="text-sm font-medium text-slate-300">
              מיקום
            </label>
            <Input
              id="location"
              name="location"
              placeholder="מיקום"
              value={formData.location}
              onChange={handleChange}
              required
              dir="rtl"
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
            />
          </div>

          <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
              onClick={onClose}
            >
              ביטול
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              שלח דיווח
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 