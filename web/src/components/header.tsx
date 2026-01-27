import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

type HeaderProps = { title?: string; onSave?: () => void };

const Header = ({ title, onSave }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between p-4 border-b bg-white z-10">
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="pl-10"
        />
      </div>
      <Button
        variant="default"
        size="sm"
        onClick={() => onSave?.()}
      >
        Save
      </Button>
    </header>
  );
};

export default Header;
