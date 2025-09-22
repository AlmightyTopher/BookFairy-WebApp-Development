/**
 * Wishlist Page Component
 *
 * Wishlist queue management with auto-promotion, priority handling,
 * and expiration management with fairy-themed design
 */

import React, { useState, useEffect } from 'react';
import { useWishlist } from '@/hooks/useWishlist';
import { useFairyContext } from '@/components/fairy';
import { Card, CardHeader, CardContent, CardTitle, BookCard } from '@/components/ui/Card';
import { Button, MagicalButton } from '@/components/ui/Button';
import { Input, SearchInput } from '@/components/ui/Input';
import { Modal, ModalContent, ModalHeader, ModalTitle, ConfirmModal } from '@/components/ui/Modal';
import { cn } from '@/utils/cn';
import type { WishlistItem, WishlistStatus } from '@/types';

export interface WishlistProps {
  className?: string;
}

const Wishlist: React.FC<WishlistProps> = ({ className }) => {
  const { celebrateAction } = useFairyContext();

  const {
    items: wishlistItems,
    queueInfo,
    isLoading,
    error,
    activeItems,
    queuedItems,
    availableItems,
    expiredItems,
    updatePriority,
    promoteFromQueue,
    removeFromWishlist,
    markAsAvailable,
    markAsUnavailable,
    clearExpired,
    reorderWishlist,
    searchWishlist,
    refreshWishlist
  } = useWishlist() as any;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<WishlistStatus | 'all'>('all');
  const [filteredItems, setFilteredItems] = useState<WishlistItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  // Filter items based on search and status
  useEffect(() => {
    let filtered = [...wishlistItems];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.book.genre.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    // Sort by priority for active items, queue position for queued items
    filtered.sort((a, b) => {
      if (a.status === 'active' && b.status === 'active') {
        return a.priority - b.priority;
      }
      if (a.status === 'queued' && b.status === 'queued') {
        return (a.queue_position || 999) - (b.queue_position || 999);
      }
      // Active items first, then queued, then others
      const statusOrder = { active: 0, queued: 1, available: 2, unavailable: 3, expired: 4 };
      return (statusOrder[a.status] || 5) - (statusOrder[b.status] || 5);
    });

    setFilteredItems(filtered);
  }, [wishlistItems, searchQuery, selectedStatus]);

  // Check for expired items on load
  useEffect(() => {
    if (expiredItems.length > 0) {
      setShowExpiredModal(true);
    }
  }, [expiredItems.length]);

  const handleItemAction = async (action: string, item: WishlistItem) => {
    try {
      switch (action) {
        case 'view':
          setSelectedItem(item);
          setIsDetailsModalOpen(true);
          break;
        case 'promote':
          await promoteFromQueue(item.id);
          celebrateAction('wishlist_promoted', { title: item.book.title });
          break;
        case 'available':
          await markAsAvailable(item.id);
          break;
        case 'unavailable':
          await markAsUnavailable(item.id);
          break;
        case 'remove':
          if (confirm(`Remove "${item.book.title}" from your wishlist?`)) {
            await removeFromWishlist(item.id);
          }
          break;
        case 'add_to_library':
          // Navigate to add to library flow
          window.location.href = `/book/${item.book.id}?action=add`;
          break;
      }
    } catch (error) {
      console.error('Wishlist action failed:', error);
    }
  };

  const handlePriorityChange = async (itemId: string, newPriority: number) => {
    try {
      await updatePriority(itemId, newPriority);
    } catch (error) {
      console.error('Priority update failed:', error);
    }
  };

  const handleClearExpired = async () => {
    try {
      const result = await clearExpired();
      setShowExpiredModal(false);
      celebrateAction('wishlist_cleanup', { count: result.removed });
    } catch (error) {
      console.error('Clear expired failed:', error);
    }
  };

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetItemId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetItemId) return;

    const currentOrder = activeItems.map((item: WishlistItem) => item.id);
    const draggedIndex = currentOrder.indexOf(draggedItem);
    const targetIndex = currentOrder.indexOf(targetItemId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Create new order
    const newOrder = [...currentOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);

    try {
      await reorderWishlist(newOrder);
      setDraggedItem(null);
    } catch (error) {
      console.error('Reorder failed:', error);
    }
  };

  const statusCounts = React.useMemo(() => {
    return {
      all: wishlistItems.length,
      active: activeItems.length,
      queued: queuedItems.length,
      available: availableItems.length,
      unavailable: wishlistItems.filter((item: WishlistItem) => item.status === 'unavailable').length,
      expired: expiredItems.length
    };
  }, [wishlistItems, activeItems, queuedItems, availableItems, expiredItems]);

  if (error) {
    return (
      <div className={cn("min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center", className)}>
        <Card variant="outline" className="text-center p-8">
          <div className="text-red-500 text-6xl mb-4">😟</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refreshWishlist}>Try Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50", className)}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
            My Wishlist Queue ⭐
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your magical reading queue! Books move from the queue to active status automatically every week.
          </p>
        </div>

        {/* Queue Info Card */}
        <Card variant="magical" className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">{queueInfo.active_items}</div>
                <div className="text-sm text-gray-600">Active Wishes</div>
                <div className="text-xs text-gray-500 mt-1">Ready to read</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{queueInfo.queue_items}</div>
                <div className="text-sm text-gray-600">In Queue</div>
                <div className="text-xs text-gray-500 mt-1">Waiting for promotion</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{availableItems.length}</div>
                <div className="text-sm text-gray-600">Available</div>
                <div className="text-xs text-gray-500 mt-1">Ready to add to library</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {queueInfo.next_promotion_date ?
                    Math.ceil((new Date(queueInfo.next_promotion_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    : 0
                  }
                </div>
                <div className="text-sm text-gray-600">Days to Promotion</div>
                <div className="text-xs text-gray-500 mt-1">Next queue update</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <SearchInput
                  placeholder="Search wishlist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClear={() => setSearchQuery('')}
                  className="md:w-64"
                />

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as WishlistStatus | 'all')}
                  className="px-3 py-2 border border-purple-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Items ({statusCounts.all})</option>
                  <option value="active">Active ({statusCounts.active})</option>
                  <option value="queued">Queued ({statusCounts.queued})</option>
                  <option value="available">Available ({statusCounts.available})</option>
                  <option value="unavailable">Unavailable ({statusCounts.unavailable})</option>
                  {statusCounts.expired > 0 && (
                    <option value="expired">Expired ({statusCounts.expired})</option>
                  )}
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsReorderMode(!isReorderMode)}
                  disabled={selectedStatus !== 'active' && selectedStatus !== 'all'}
                >
                  {isReorderMode ? 'Done Reordering' : 'Reorder'}
                </Button>
                <MagicalButton onClick={() => window.location.href = '/discovery'}>
                  Add Books
                </MagicalButton>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wishlist Items */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-80"></div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">
              {searchQuery || selectedStatus !== 'all' ? '🔍' : '⭐'}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || selectedStatus !== 'all'
                ? 'No items match your search'
                : 'Your wishlist is empty'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedStatus !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'Ready to start building your reading wishlist?'
              }
            </p>
            <MagicalButton onClick={() => window.location.href = '/discovery'}>
              {searchQuery || selectedStatus !== 'all'
                ? 'Clear Filters'
                : 'Discover Books'
              }
            </MagicalButton>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Active Items */}
            {(selectedStatus === 'all' || selectedStatus === 'active') && activeItems.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">🌟</span>
                  Active Wishes
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({activeItems.length} of 10 slots)
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeItems.map((item: WishlistItem, index: number) => (
                    <div
                      key={item.id}
                      draggable={isReorderMode}
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, item.id)}
                      className={cn(
                        "relative",
                        isReorderMode && "cursor-move",
                        draggedItem === item.id && "opacity-50"
                      )}
                    >
                      <WishlistItemCard
                        item={item}
                        showPriority
                        onAction={(action) => handleItemAction(action, item)}
                        onPriorityChange={(priority) => handlePriorityChange(item.id, priority)}
                      />
                      {isReorderMode && (
                        <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded">
                          #{index + 1}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Queued Items */}
            {(selectedStatus === 'all' || selectedStatus === 'queued') && queuedItems.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">📋</span>
                  Queue
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    (Next promotion: {queueInfo.next_promotion_date ?
                      new Date(queueInfo.next_promotion_date).toLocaleDateString()
                      : 'Soon'})
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {queuedItems.map((item: WishlistItem) => (
                    <WishlistItemCard
                      key={item.id}
                      item={item}
                      showQueuePosition
                      onAction={(action) => handleItemAction(action, item)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Available Items */}
            {(selectedStatus === 'all' || selectedStatus === 'available') && availableItems.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">✅</span>
                  Available Now
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableItems.map((item: WishlistItem) => (
                    <WishlistItemCard
                      key={item.id}
                      item={item}
                      onAction={(action) => handleItemAction(action, item)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other filtered items */}
            {selectedStatus !== 'all' && selectedStatus !== 'active' && selectedStatus !== 'queued' && selectedStatus !== 'available' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item: WishlistItem) => (
                  <WishlistItemCard
                    key={item.id}
                    item={item}
                    onAction={(action) => handleItemAction(action, item)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Expired Items Modal */}
        <ConfirmModal
          isOpen={showExpiredModal}
          onClose={() => setShowExpiredModal(false)}
          onConfirm={handleClearExpired}
          title="Expired Wishlist Items"
          description={`You have ${expiredItems.length} expired items in your wishlist. Would you like to remove them automatically?`}
          confirmText="Clear Expired"
          cancelText="Keep Them"
        />

        {/* Item Details Modal */}
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          size="lg"
          variant="fairy"
        >
          <ModalHeader>
            <ModalTitle>Wishlist Item Details</ModalTitle>
          </ModalHeader>
          <ModalContent>
            {selectedItem && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Book Cover */}
                  <div className="flex-shrink-0">
                    <div className="w-48 h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg overflow-hidden">
                      {selectedItem.book.cover_image_url ? (
                        <img
                          src={selectedItem.book.cover_image_url}
                          alt={selectedItem.book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-purple-400">
                          <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedItem.book.title}</h2>
                      <p className="text-lg text-gray-600">{selectedItem.book.author}</p>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Status</span>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          selectedItem.status === 'active' && "bg-green-100 text-green-800",
                          selectedItem.status === 'queued' && "bg-blue-100 text-blue-800",
                          selectedItem.status === 'available' && "bg-yellow-100 text-yellow-800",
                          selectedItem.status === 'unavailable' && "bg-red-100 text-red-800"
                        )}>
                          {selectedItem.status}
                        </span>
                      </div>

                      {selectedItem.status === 'active' && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Priority</span>
                          <span className="text-sm text-gray-600">#{selectedItem.priority}</span>
                        </div>
                      )}

                      {selectedItem.queue_position && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Queue Position</span>
                          <span className="text-sm text-gray-600">#{selectedItem.queue_position}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Days Remaining</span>
                        <span className="text-sm text-gray-600">{selectedItem.days_remaining} days</span>
                      </div>
                    </div>

                    {/* Fairy Message */}
                    {selectedItem.fairy_message && (
                      <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                        <p className="text-sm text-pink-800">
                          💫 {selectedItem.fairy_message}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.status === 'queued' && (
                        <Button onClick={() => handleItemAction('promote', selectedItem)}>
                          Promote Now
                        </Button>
                      )}
                      {selectedItem.status === 'available' && (
                        <Button onClick={() => handleItemAction('add_to_library', selectedItem)}>
                          Add to Library
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => handleItemAction('view', selectedItem)}
                      >
                        View Book Details
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleItemAction('remove', selectedItem)}
                      >
                        Remove from Wishlist
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Synopsis */}
                {selectedItem.book.synopsis && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Synopsis</label>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {selectedItem.book.synopsis}
                    </p>
                  </div>
                )}
              </div>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};

// Wishlist Item Card Component
interface WishlistItemCardProps {
  item: WishlistItem;
  showPriority?: boolean;
  showQueuePosition?: boolean;
  onAction: (action: string) => void;
  onPriorityChange?: (priority: number) => void;
}

const WishlistItemCard: React.FC<WishlistItemCardProps> = ({
  item,
  showPriority = false,
  showQueuePosition = false,
  onAction,
  onPriorityChange
}) => {
  const statusColors = {
    active: 'bg-green-100 text-green-800 border-green-200',
    queued: 'bg-blue-100 text-blue-800 border-blue-200',
    available: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    unavailable: 'bg-red-100 text-red-800 border-red-200',
    expired: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  return (
    <Card variant="elevated" className="group">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          {/* Book Cover */}
          <div className="w-16 h-20 flex-shrink-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg overflow-hidden">
            {item.book.cover_image_url ? (
              <img
                src={item.book.cover_image_url}
                alt={item.book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-purple-400">
                📚
              </div>
            )}
          </div>

          {/* Book Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-700 transition-colors">
                {item.book.title}
              </h3>
              <p className="text-sm text-gray-600">{item.book.author}</p>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium border",
                statusColors[item.status]
              )}>
                {item.status}
              </span>

              {showPriority && onPriorityChange && (
                <select
                  value={item.priority}
                  onChange={(e) => onPriorityChange(parseInt(e.target.value))}
                  className="text-xs border border-gray-300 rounded px-1 py-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(priority => (
                    <option key={priority} value={priority}>#{priority}</option>
                  ))}
                </select>
              )}

              {showQueuePosition && item.queue_position && (
                <span className="text-xs text-gray-500">
                  Queue #{item.queue_position}
                </span>
              )}
            </div>

            {/* Days Remaining */}
            <div className="text-xs text-gray-500">
              {item.days_remaining > 0 ? (
                `${item.days_remaining} days remaining`
              ) : (
                <span className="text-red-600 font-medium">Expired</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-1 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction('view')}
                className="flex-1"
              >
                Details
              </Button>
              {item.status === 'queued' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onAction('promote')}
                >
                  Promote
                </Button>
              )}
              {item.status === 'available' && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onAction('add_to_library')}
                >
                  Add
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Wishlist;