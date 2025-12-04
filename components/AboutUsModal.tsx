
import React from 'react';
import { Modal } from '@/components/shared/Modal';
import { Button } from '@/components/shared/Button';

interface AboutUsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AboutUsModal: React.FC<AboutUsModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="About AgriFAAS Connect">
            <div className="space-y-4">
                <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-800">AgriFAAS Connect</h3>
                    <p className="text-sm text-gray-500">Farm Management Suite</p>
                </div>
                
                <p className="text-gray-600 text-sm">
                    AgriFAAS Connect empowers farmers with tools for operations, finance, HR, inventory, and AI-driven insights to maximize productivity and sustainability.
                </p>

                <div className="bg-gray-50 p-3 rounded text-xs text-gray-500">
                    <p><strong>Version:</strong> 1.0.0</p>
                    <p><strong>Support:</strong> support@agrifaas.com</p>
                </div>

                <div className="flex justify-end pt-2">
                    <Button onClick={onClose}>Close</Button>
                </div>
            </div>
        </Modal>
    );
};
