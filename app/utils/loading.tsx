export const LoadingSpinner = () => (
  <div className="fixed top-0 left-0 w-screen h-screen bg-white/80 backdrop-blur-sm flex justify-center items-center z-[9999]">
    <div className="flex flex-col items-center gap-2.5 text-emerald-500 font-semibold text-2xl">
      <div className="border-[5px] border-emerald-500 border-t-transparent rounded-full w-20 h-20 animate-spin"></div>
    </div>
  </div>
);

export default LoadingSpinner;
