
import React from 'react';
import type { Farmer } from '../types';
import { Modal } from '@/components/shared/Modal';

interface FarmerDetailModalProps {
    farmer: Farmer;
    onClose: () => void;
}

export const FarmerDetailModal: React.FC<FarmerDetailModalProps> = ({ farmer, onClose }) => {
    return (
        <Modal isOpen={!!farmer} onClose={onClose} title="Farmer Details" size="lg">
            <div className="space-y-4">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-gray-800">{farmer.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        farmer.status === 'Active' ? 'bg-green-100 text-green-800' : 
                        farmer.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                        {farmer.status || 'Active'}
                    </span>
                </div>
                
                <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm pt-2 border-t">
                    <div className="font-semibold text-gray-500 col-span-1">Location:</div> <div className="col-span-2">{farmer.location}</div>
                    <div className="font-semibold text-gray-500 col-span-1">Contact:</div> <div className="col-span-2">{farmer.contact}</div>
                    <div className="font-semibold text-gray-500 col-span-1">Farm Size:</div> <div className="col-span-2">{farmer.farmSize} acres</div>
                    <div className="font-semibold text-gray-500 col-span-1">Crops:</div> <div className="col-span-2">{farmer.crops.join(', ')}</div>
                    
                    {/* Optional Fields */}
                    {farmer.gender && <><div className="font-semibold text-gray-500 col-span-1">Gender:</div> <div className="col-span-2">{farmer.gender}</div></>}
                    {farmer.age && <><div className="font-semibold text-gray-500 col-span-1">Age:</div> <div className="col-span-2">{farmer.age}</div></>}
                    {farmer.educationLevel && <><div className="font-semibold text-gray-500 col-span-1">Education:</div> <div className="col-span-2">{farmer.educationLevel}</div></>}
                    {farmer.phoneType && <><div className="font-semibold text-gray-500 col-span-1">Phone Type:</div> <div className="col-span-2">{farmer.phoneType}</div></>}
                    {farmer.waterSource && <><div className="font-semibold text-gray-500 col-span-1">Water Source:</div> <div className="col-span-2">{farmer.waterSource}</div></>}
                    {farmer.tenure && <><div className="font-semibold text-gray-500 col-span-1">Land Tenure:</div> <div className="col-span-2">{farmer.tenure}</div></>}
                    {farmer.livestock && farmer.livestock.length > 0 && <><div className="font-semibold text-gray-500 col-span-1">Livestock:</div> <div className="col-span-2">{farmer.livestock.join(', ')}</div></>}
                </div>
                <div>
                    <h4 className="font-semibold text-gray-600">Notes:</h4>
                    <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-2 rounded-md mt-1">{farmer.notes || 'No notes available.'}</p>
                </div>
            </div>
        </Modal>
    );
};
