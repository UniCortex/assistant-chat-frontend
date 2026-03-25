import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import ChatPage from "@/pages/ChatPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChatPage />
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}

export default App;
