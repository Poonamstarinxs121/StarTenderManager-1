import { useState } from "react";
import FilterSection from "@/components/tenders/FilterSection";
import TenderTable from "@/components/tenders/TenderTable";
import AddTenderModal from "@/components/tenders/AddTenderModal";
import ViewTenderModal from "@/components/tenders/ViewTenderModal";
import NewTenderProcess from "@/components/tenders/NewTenderProcess";
import RecentActivity from "@/components/activity/RecentActivity";
import { useQuery } from "@tanstack/react-query";
import { Tender } from "@/types";

export default function TenderManagement() {
  // UI states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showNewTenderProcess, setShowNewTenderProcess] = useState(false);
  const [currentTenderId, setCurrentTenderId] = useState<number | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    status: "all",
    clientId: "all",
    startDate: "",
    endDate: "",
    search: "",
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Build query string from filters
  const getQueryString = () => {
    const params = new URLSearchParams();
    
    if (filters.status && filters.status !== "all") params.append("status", filters.status);
    if (filters.clientId && filters.clientId !== "all" && filters.clientId !== "no-clients") params.append("clientId", filters.clientId);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.search) params.append("search", filters.search);
    
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    
    return params.toString();
  };

  // Fetch tenders with filters
  const { data, isLoading, refetch } = useQuery<{ 
    tenders: Tender[], 
    total: number 
  }>({
    queryKey: [`/api/tenders?${getQueryString()}`],
  });

  // Handlers
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
    setShowNewTenderProcess(false);
  };
  
  const handleCloseAddModal = () => setIsAddModalOpen(false);
  
  const handleViewTender = (id: number) => {
    setCurrentTenderId(id);
    setIsViewModalOpen(true);
  };
  
  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setCurrentTenderId(null);
  };
  
  const handleEditTender = (id: number) => {
    setCurrentTenderId(id);
    setIsViewModalOpen(false);
    setIsAddModalOpen(true);
  };
  
  const handleApplyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };
  
  const handleResetFilters = () => {
    setFilters({
      status: "all",
      clientId: "all",
      startDate: "",
      endDate: "",
      search: "",
    });
    setPage(1);
  };
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when limit changes
  };
  
  const handleOpenNewTenderProcess = () => {
    setShowNewTenderProcess(true);
  };
  
  const handleCloseNewTenderProcess = () => {
    setShowNewTenderProcess(false);
  };

  if (showNewTenderProcess) {
    return (
      <NewTenderProcess
        onCancel={handleCloseNewTenderProcess}
        onSuccess={() => {
          refetch();
          setShowNewTenderProcess(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-medium text-text-primary">Tender Management</h2>
          <p className="text-muted-foreground text-sm">Create and manage tender documentation</p>
        </div>
        <button
          className="bg-primary text-white px-4 py-2 rounded-md flex items-center"
          onClick={handleOpenNewTenderProcess}
        >
          <span className="mr-1">+</span>
          <span>Add New Tender</span>
        </button>
      </div>

      <FilterSection 
        filters={filters} 
        onApplyFilters={handleApplyFilters} 
        onResetFilters={handleResetFilters} 
      />

      <TenderTable
        tenders={data?.tenders || []}
        isLoading={isLoading}
        total={data?.total || 0}
        page={page}
        limit={limit}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        onViewTender={handleViewTender}
        onEditTender={handleEditTender}
        onRefresh={refetch}
      />

      <RecentActivity />

      {isAddModalOpen && (
        <AddTenderModal 
          isOpen={isAddModalOpen} 
          onClose={handleCloseAddModal} 
          editId={currentTenderId}
          onSuccess={() => {
            refetch();
            setCurrentTenderId(null);
          }}
        />
      )}

      {isViewModalOpen && currentTenderId && (
        <ViewTenderModal 
          isOpen={isViewModalOpen} 
          onClose={handleCloseViewModal} 
          tenderId={currentTenderId}
          onEdit={() => handleEditTender(currentTenderId)}
        />
      )}
    </div>
  );
}
