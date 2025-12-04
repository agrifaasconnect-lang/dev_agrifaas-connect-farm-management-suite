
import React from 'react';
import type { Feature } from '../types';

interface SidebarProps {
    currentView: Feature;
    onSetView: (view: Feature) => void;
    features: Feature[];
    workspaceName: string;
    workspaceLogo?: string;
    isOpen: boolean;
    onClose: () => void;
}

// Icon Components
const IconDashboard = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 8.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 018.25 20.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
);
const IconOperations = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.471-2.471a.563.563 0 01.8 0l2.47 2.471M11.42 15.17l-4.637-4.637a5.25 5.25 0 017.425-7.425l4.637 4.637M11.42 15.17L3 21m8.42-5.83l-4.637 4.637" /></svg>
);
const IconFinancials = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
);
const IconHR = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663M12 3.375c-3.418 0-6.166 2.748-6.166 6.166s2.748 6.166 6.166 6.166 6.166-2.748 6.166-6.166S15.418 3.375 12 3.375z" /></svg>
);
const IconInventory = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
);
const IconPlots = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.362-3.362 8.287 8.287 0 003-.024zM12 18a6 6 0 100-12 6 6 0 000 12z" /></svg>
);
const IconAEO = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.5h3.841a.75.75 0 00.447-1.392l-3.841-2.305a.75.75 0 01-.447-1.392l3.841-2.305a.75.75 0 00.447-1.392l-3.841-2.305a.75.75 0 01-.447-1.392l3.841-2.305a.75.75 0 00.447-1.392l-3.841-2.305M3 14.25v-2.625a3.375 3.375 0 013.375-3.375h1.5A1.125 1.125 0 009 7.125v-1.5A3.375 3.375 0 0112.375 2.25H15" /></svg>
);
const IconAI = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.5 21.75l-.398-1.178a3.375 3.375 0 00-2.303-2.302L12.75 18l1.178-.398a3.375 3.375 0 002.302-2.302L17.25 14.25l.398 1.178a3.375 3.375 0 002.302 2.302L21 18l-1.178.398a3.375 3.375 0 00-2.302 2.302z" /></svg>
);
const IconAdmin = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.002 1.118-1.002h1.078c.558 0 1.028.46 1.118 1.002l.143.856c.334.202.658.423.966.66l.829-.395c.532-.254 1.146.03 1.37.545l.538 1.076c.224.514-.04.1.09-.533l-.395.829c.237.308.458.632.66.966l.856.143c.542.09 1.002.56 1.002 1.118v1.078c0 .558-.46 1.028-1.002 1.118l-.856.143c-.202.334-.423.658-.66.966l.395.829c.254.532-.03 1.146-.545 1.37l-1.076.538c-.514.224-1.09-.04-1.37-.533l-.829-.395a6.45 6.45 0 01-.966.66l-.143.856c-.09.542-.56 1.002-1.118 1.002h-1.078c-.558 0-1.028-.46-1.118-1.002l-.143-.856a6.45 6.45 0 01-.966-.66l-.829.395c-.532.254-1.146-.03-1.37-.545l-.538-1.076c-.224-.514.04-1.09.533-1.37l.395-.829a6.45 6.45 0 01-.66-.966l-.856-.143c-.542-.09-1.002-.56-1.002-1.118v-1.078c0-.558.46-1.028 1.002-1.118l.856-.143a6.45 6.45 0 01.66-.966l-.395-.829c-.254-.532.03-1.146.545-1.37l1.076-.538c.514-.224 1.09.04 1.37.533l.829.395c.308-.237.632-.458.966-.66l.143-.856zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" /></svg>
);
const IconSuppliers = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5v-2.172c0-.621.504-1.125 1.125-1.125h12.75c.621 0 1.125.504 1.125 1.125V18.75M10.5 6h.008v.008h-.008V6zM13.5 6h.008v.008h-.008V6z" /></svg>
);
const IconSales = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.75-2.25M21 12l-3.75 2.25" /></svg>
);
const IconHowTo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
);
const IconFAQ = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
);

const featureIcons: Record<Feature, React.FC<React.SVGProps<SVGSVGElement>>> = {
    'Dashboard': IconDashboard,
    'Operations': IconOperations,
    'Financials': IconFinancials,
    'HR': IconHR,
    'Inventory': IconInventory,
    'Plots & Seasons': IconPlots,
    'AEO': IconAEO,
    'AI Insights': IconAI,
    'Admin': IconAdmin,
    'Suppliers': IconSuppliers,
    'Harvest & Sales': IconSales,
    'How To': IconHowTo,
    'FAQ': IconFAQ,
};


const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const LogoIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.362-3.362 8.287 8.287 0 003-.024zM12 18a6 6 0 100-12 6 6 0 000 12z" />
    </svg>
);


export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSetView, features, workspaceName, workspaceLogo, isOpen, onClose }) => {
    return (
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white flex-shrink-0 flex flex-col border-r border-gray-200 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="h-16 flex items-center justify-between border-b border-gray-200 px-4 flex-shrink-0">
                <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 bg-green-600 rounded-lg overflow-hidden flex-shrink-0 w-8 h-8 flex items-center justify-center">
                        {workspaceLogo ? (
                            <img src={workspaceLogo} alt="WS" className="w-full h-full object-cover" />
                        ) : (
                            <LogoIcon className="h-5 w-5 text-white" />
                        )}
                    </div>
                    <h2 className="text-lg font-bold text-gray-800 truncate" title={workspaceName}>
                        {workspaceName}
                    </h2>
                </div>
                 <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-800">
                     <span className="sr-only">Close sidebar</span>
                     <XIcon className="h-6 w-6" />
                </button>
            </div>
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                {features.map((feature) => {
                    const Icon = featureIcons[feature];
                    return (
                        <button
                            key={feature}
                            onClick={() => onSetView(feature)}
                            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-left text-sm transition-colors
                                ${currentView === feature
                                    ? 'bg-green-50 text-green-700 font-semibold'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-green-700'
                                }`}
                        >
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            <span>{feature}</span>
                        </button>
                    )
                })}
            </nav>
        </aside>
    );
};
