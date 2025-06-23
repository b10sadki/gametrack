import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Star, Clock, Calendar } from 'lucide-react';
import { Game } from '../lib/api';
import { UserGame, GameStatus, updateUserGameData } from '../lib/gameStorage';
import { useGameStorage } from '../hooks/usePocketBaseGameStorage';

interface GameDetailsModalProps {
  game: Game | UserGame | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

const GameDetailsModal: React.FC<GameDetailsModalProps> = ({ game, isOpen, onClose, onSave }) => {
  const { saveGame } = useGameStorage();
  const [status, setStatus] = useState<GameStatus>('none');
  const [rating, setRating] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [playTime, setPlayTime] = useState<number>(0);
  const [hoveredStar, setHoveredStar] = useState<number>(0);

  useEffect(() => {
    if (game && 'status' in game) {
      const userGame = game as UserGame;
      setStatus(userGame.status);
      setRating(userGame.rating || 0);
      setNotes(userGame.notes || '');
      setPlayTime(userGame.playTime || 0);
    } else {
      setStatus('none');
      setRating(0);
      setNotes('');
      setPlayTime(0);
    }
  }, [game]);

  const handleSave = () => {
    if (!game) return;

    if ('status' in game) {
      // Mise a jour d'un jeu existant
      updateUserGameData(game.id, {
        status,
        rating: rating > 0 ? rating : undefined,
        notes: notes.trim() || undefined,
        playTime: playTime > 0 ? playTime : undefined
      });
    } else {
      // Ajout d'un nouveau jeu
      saveGame(game, status, {
        rating: rating > 0 ? rating : undefined,
        notes: notes.trim() || undefined,
        playTime: playTime > 0 ? playTime : undefined
      });
    }

    onSave?.();
    onClose();
  };

  const renderStars = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 cursor-pointer transition-colors ${
              star <= (hoveredStar || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
            onClick={() => setRating(star === rating ? 0 : star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
          />
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm text-muted-foreground">
            {rating}/5 etoiles
          </span>
        )}
      </div>
    );
  };





  if (!game) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{game.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image et informations de base */}
          <div className="flex gap-4">
            {game.background_image && (
              <img
                src={game.background_image}
                alt={game.name}
                className="w-32 h-48 object-cover rounded-lg"
              />
            )}
            <div className="flex-1 space-y-2">
              {game.released && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {new Date(game.released).toLocaleDateString('en-US')}
                </div>
              )}
              {game.metacritic && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Metacritic:</span>
                  <Badge variant={game.metacritic >= 75 ? 'default' : 'secondary'}>
                    {game.metacritic}
                  </Badge>
                </div>
              )}
              <div className="flex flex-wrap gap-1">
                {game.genres.map((genre) => (
                  <Badge key={genre.id} variant="outline" className="text-xs">
                    {genre.name}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {game.platforms.map((platform) => (
                  <Badge key={platform.platform.id} variant="secondary" className="text-xs">
                    {platform.platform.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={(value: GameStatus) => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not added</SelectItem>
                <SelectItem value="wishlist">Wishlist</SelectItem>
              <SelectItem value="backlog">To Play</SelectItem>
              <SelectItem value="playing">Playing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Note (only for completed games) */}
          {status === 'completed' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Personal rating</label>
              {renderStars()}
            </div>
          )}

          {/* Play time */}
          {(status === 'playing' || status === 'completed') && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Play time (hours)
              </label>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={playTime || ''}
                onChange={(e) => setPlayTime(parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          )}

          {/* Personal notes */}
          {status !== 'none' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Personal notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Your impressions, comments, tips..."
                rows={4}
              />
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={onClose}
              className="flex items-center px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 rounded-lg transition-colors bg-primary text-primary-foreground"
            >
              Save
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GameDetailsModal;