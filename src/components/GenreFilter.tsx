import React, { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { Filter, X } from 'lucide-react';
import { Genre } from '../lib/api';

interface GenreFilterProps {
  availableGenres: Genre[];
  selectedGenres: number[];
  onGenreChange: (genreIds: number[]) => void;
  className?: string;
}

const GenreFilter: React.FC<GenreFilterProps> = ({
  availableGenres,
  selectedGenres,
  onGenreChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleGenreToggle = (genreId: number) => {
    const newSelection = selectedGenres.includes(genreId)
      ? selectedGenres.filter(id => id !== genreId)
      : [...selectedGenres, genreId];
    
    onGenreChange(newSelection);
  };

  const clearAllGenres = () => {
    onGenreChange([]);
  };

  const getSelectedGenreNames = () => {
    return availableGenres
      .filter(genre => selectedGenres.includes(genre.id))
      .map(genre => genre.name);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            <Filter className="w-4 h-4 mr-2" />
            {selectedGenres.length > 0 
              ? `${selectedGenres.length} genre(s) sélectionné(s)`
              : 'Filter by genre'
            }
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Genres</h4>
              {selectedGenres.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllGenres}
                  className="h-auto p-1 text-xs"
                >
                  Tout effacer
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              {availableGenres.map((genre) => (
                <div key={genre.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`genre-${genre.id}`}
                    checked={selectedGenres.includes(genre.id)}
                    onCheckedChange={() => handleGenreToggle(genre.id)}
                  />
                  <label
                    htmlFor={`genre-${genre.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {genre.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Affichage des genres sélectionnés */}
      {selectedGenres.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {getSelectedGenreNames().map((genreName, index) => {
            const genre = availableGenres.find(g => g.name === genreName);
            return (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => genre && handleGenreToggle(genre.id)}
              >
                {genreName}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GenreFilter;