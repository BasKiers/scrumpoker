import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent } from './ui/tooltip';

interface NameModalProps {
  isOpen: boolean;
  onSubmit: (name: string) => void;
  onSkip: () => void;
  roomUrl: string;
}

const NameModal: React.FC<NameModalProps> = ({ isOpen, onSubmit, onSkip, roomUrl }) => {
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState<string>();
  const [showCopied, setShowCopied] = React.useState(false);

  const validateName = (value: string): boolean => {
    // Allow alphanumeric characters and whitespace
    const isValid = /^[a-zA-Z0-9\s]*$/.test(value);
    if (!isValid) {
      setError('Name can only contain letters, numbers, and spaces');
      return false;
    }
    setError(undefined);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateName(name)) {
      onSubmit(name.trim());
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    validateName(value);
  };

  const copyRoomUrl = () => {
    navigator.clipboard.writeText(roomUrl);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={(open) => {if(!open) {onSkip()}}}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enter Your Name</DialogTitle>
            <DialogDescription>
              Choose a name to identify yourself in the room
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="room-url">Room URL</Label>
              <div className="flex gap-2">
                <Input
                  id="room-url"
                  value={roomUrl}
                  readOnly
                  className="flex-1"
                />
                <TooltipRoot open={showCopied}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={copyRoomUrl}
                      type="button"
                    >
                      Copy
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={2}>
                    Copied to clipboard!
                  </TooltipContent>
                </TooltipRoot>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Input
                  id="name"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="Enter your name"
                  autoFocus
                  data-1p-ignore
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onSkip}
                >
                  Spectate
                </Button>
                <Button
                  type="submit"
                  disabled={!name.trim() || !!error}
                  variant="outline"
                >
                  Join
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default NameModal; 