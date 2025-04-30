import React from 'react';

const Description = () => {
  return (
    <div className="bg-dark shadow-xl shadow-black border border-mid-light p-8 rounded-md">
      <div className="max-w-[1800px] mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-4">
          Vortex Distribution Dashboard
        </h1>
        <p className="text-gray-300 text-lg mb-3">
          Welcome to the Vortex Distribution Dashboard. This analysis tool can be used to provide in depth information regarding The Root Network Vortex Distribution payout.
          Data is available from cycle 6 onwards for each account that participated as a staker, nominator or validator.
        </p>
        <p className="text-gray-300">
          Use the filters below to explore specific reward cycles, track account activities, and view exactly what was included in the calculations for each cycle.
          Enter a database name for custom environments, an account ID to filter by specific address, or a Vortex Distribution ID to view cycle-specific data.
        </p>
      </div>
    </div>
  );
};

export default Description; 