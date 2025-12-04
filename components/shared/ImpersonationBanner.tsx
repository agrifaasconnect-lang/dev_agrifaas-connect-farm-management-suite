import React from 'react';
import { Button } from './Button';

interface ImpersonationBannerProps {
    userName: string;
    onExit: () => void;
}

export const ImpersonationBanner: React.FC<ImpersonationBannerProps> = ({ userName, onExit }) => {
    return (
        <div className="bg-yellow-500 text-black px-4 py-2 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
                <span className="font-bold">⚠️ IMPERSONATION MODE</span>
                <span>You are viewing as: <strong>{userName}</strong></span>
            </div>
            <Button 
                variant="secondary" 
                onClick={onExit}
                className="!bg-black !text-yellow-500 hover:!bg-gray-800"
            >
                Exit Impersonation
            </Button>
        </div>
    );
};

