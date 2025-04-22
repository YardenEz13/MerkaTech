export const formatDate = (timestamp) => {
  try {
    if (!timestamp) return ['תאריך לא זמין', ''];
    
    // If timestamp is a string in Hebrew format
    if (typeof timestamp === 'string') {
      if (timestamp.includes('בשעה')) {
        const parts = timestamp.split('בשעה');
        return [parts[0].trim(), parts.length > 1 ? parts[1].trim() : ''];
      }
      return [timestamp, ''];
    }
    
    // For numeric timestamps
    const timeValue = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
    
    if (isNaN(timeValue)) return ['תאריך לא זמין', ''];
    
    const date = new Date(timeValue);
    const formattedDate = new Intl.DateTimeFormat('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
    
    const parts = formattedDate.split(',');
    return parts.length > 1 ? parts : [formattedDate, ''];
  } catch (error) {
    console.error("Date formatting error:", error, timestamp);
    return ['תאריך לא זמין', ''];
  }
}; 