"use client";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/redux/slices/auth";
import { CustomWallet } from "@/components/shared/custom-wallet/CustomWallet";

const Header = () => {
  const user = useSelector(selectCurrentUser);

  return (
    <header className="border-[var(--border-color)] bg-[var(--header-background)] px-4 h-[5.5rem] border-b fixed top-0 w-full z-50">
      <div className="h-full max-w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 w-[200px]">
          <img src="/main-logo.svg" alt="DaMeta1" className="hidden md:block" />
          <img
            src="/mobile-logo.svg"
            alt="DaMeta1"
            className="block md:hidden"
            width={130}
          />
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <CustomWallet />
              <span className="text-lg font-medium hidden lg:block whitespace-nowrap text-[var(--text-primary)]">
                {user.userName}
              </span>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
