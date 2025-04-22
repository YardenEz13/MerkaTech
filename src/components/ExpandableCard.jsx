import React from 'react';
import { X, Calendar, MapPin, Clock, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
const ExpandableCard = ({ isOpen, onClose, card, id }) => {
  if (!isOpen || !card) return null;

  // Safely convert any potential numeric values to strings
  const safeString = (value) => {
    if (value === null || value === undefined) return '';
    return String(value);
  };

  // Determine status icon
  const getStatusIcon = () => {
    const status = card.status?.toLowerCase() || '';
    if (status.includes('הצלחה') || status.includes('הושלם')) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (status.includes('כשל') || status.includes('נכשל')) {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    } else {
      return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <Card id={id} className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-slate-900 border-slate-700 text-white shadow-2xl animate-fade-in-up">
        <CardHeader className="relative bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700">
          <Button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-full bg-slate-700/50 hover:bg-slate-700 text-gray-300 hover:text-white transition-colors"
            aria-label="סגור"
          >
            <X className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2 mb-1">
            {getStatusIcon()}
            <CardTitle className="text-xl font-bold">{safeString(card.description)}</CardTitle>
          </div>
          
          <div className="flex flex-wrap gap-3 text-sm text-gray-300">
            {card.timestamp && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-blue-400" />
                <span>{safeString(card.timestamp)}</span>
              </div>
            )}
            
            {card.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span>{safeString(card.location)}</span>
              </div>
            )}
            
            {card.status && (
              <div className="flex items-center gap-1 mr-auto">
                <Clock className="h-4 w-4 text-blue-400" />
                <span>{safeString(card.status)}</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-4 space-y-4">
          {card.imageUrl && (
            <div className="flex justify-center mb-4">
              <img
                src={card.imageUrl}
                alt={safeString(card.alt) || "תמונת אירוע"}
                className="max-w-full max-h-[400px] rounded-lg shadow-md object-contain bg-slate-800"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/400x300?text=תמונה+לא+זמינה';
                }}
              />
            </div>
          )}
          
          {card.detailedDescription && (
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <h3 className="text-lg font-medium mb-2 text-white">פרטי האירוע:</h3>
              <p className="text-gray-300 whitespace-pre-line">{safeString(card.detailedDescription)}</p>
            </div>
          )}
          
          {card.id && (
            <div className="text-xs text-gray-400 mt-2">
              מזהה אירוע: {safeString(card.id)}
            </div>
          )}
        </CardContent>
        
        {card.ctaLink && (
          <CardFooter className="border-t border-slate-700/50 p-4 bg-slate-800/30">
            <a
              href={card.ctaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-center transition-colors shadow-md hover:shadow-lg flex items-center justify-center"
            >
              {safeString(card.ctaText) || "צפה בפרטים נוספים"}
            </a>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default ExpandableCard; 