'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/types/api';

export interface ProductReview {
  id: string;
  productId: number | string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  helpful: number;
  verified: boolean;
}

interface CreateReviewData {
  productId: number | string;
  rating: number;
  title: string;
  comment: string;
}

interface UpdateReviewData {
  reviewId: string;
  rating?: number;
  title?: string;
  comment?: string;
}

interface UseProductReviewsReturn {
  reviews: ProductReview[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  createReview: (data: CreateReviewData) => void;
  updateReview: (data: UpdateReviewData) => void;
  deleteReview: (reviewId: string) => void;
  markHelpful: (reviewId: string) => void;
  averageRating: number | null;
  totalReviews: number;
}

// Simulated API functions - replace with actual API calls
const fetchProductReviews = async (productId: string | number): Promise<ProductReview[]> => {
  // This would be a real API call in production
  console.log(`Fetching reviews for product ${productId}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simulate reviews data
  return [
    {
      id: '1',
      productId,
      userId: 'user123',
      userName: 'John Doe',
      rating: 5,
      title: 'Great product!',
      comment: 'This is exactly what I was looking for. Highly recommended!',
      createdAt: '2023-06-15T10:30:00Z',
      helpful: 12,
      verified: true
    },
    {
      id: '2',
      productId,
      userId: 'user456',
      userName: 'Jane Smith',
      rating: 4,
      title: 'Good but could be better',
      comment: 'Overall satisfied with the purchase but there are a few minor issues.',
      createdAt: '2023-06-10T14:20:00Z',
      helpful: 5,
      verified: true
    }
  ];
};

/**
 * Custom hook for product reviews using React Query
 * Handles fetching, creating, updating, and deleting reviews
 * Compatible with Next.js App Router and hydration
 */
export const useProductReviews = (productId: string | number): UseProductReviewsReturn => {
  const queryClient = useQueryClient();
  const reviewsQueryKey = ['product', productId, 'reviews'];
  
  // Query to fetch product reviews
  const { data: reviews = [], isLoading, isError, error } = useQuery<ProductReview[], ApiError>({
    queryKey: reviewsQueryKey,
    queryFn: () => fetchProductReviews(productId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Calculate average rating and total reviews
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : null;
  const totalReviews = reviews.length;
  
  // Mutation to create a new review
  const createReviewMutation = useMutation({
    mutationFn: async (data: CreateReviewData) => {
      // This would be a real API call in production
      console.log('Creating review:', data);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful response
      const newReview: ProductReview = {
        id: `review-${Date.now()}`,
        productId: data.productId,
        userId: 'current-user-id', // Would come from auth context
        userName: 'Current User', // Would come from auth context
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        createdAt: new Date().toISOString(),
        helpful: 0,
        verified: true
      };
      
      return newReview;
    },
    onSuccess: (newReview) => {
      // Update cache with the new review
      queryClient.setQueryData<ProductReview[]>(reviewsQueryKey, (oldData = []) => [
        newReview,
        ...oldData
      ]);
    }
  });
  
  // Mutation to update an existing review
  const updateReviewMutation = useMutation({
    mutationFn: async (data: UpdateReviewData) => {
      // This would be a real API call in production
      console.log('Updating review:', data);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return data;
    },
    onSuccess: (data) => {
      // Update cache with the updated review
      queryClient.setQueryData<ProductReview[]>(reviewsQueryKey, (oldData = []) => 
        oldData.map(review => 
          review.id === data.reviewId 
            ? { 
                ...review, 
                ...(data.rating !== undefined && { rating: data.rating }),
                ...(data.title !== undefined && { title: data.title }),
                ...(data.comment !== undefined && { comment: data.comment })
              } 
            : review
        )
      );
    }
  });
  
  // Mutation to delete a review
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      // This would be a real API call in production
      console.log('Deleting review:', reviewId);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return reviewId;
    },
    onSuccess: (reviewId) => {
      // Update cache by removing the deleted review
      queryClient.setQueryData<ProductReview[]>(reviewsQueryKey, (oldData = []) => 
        oldData.filter(review => review.id !== reviewId)
      );
    }
  });
  
  // Mutation to mark a review as helpful
  const markHelpfulMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      // This would be a real API call in production
      console.log('Marking review as helpful:', reviewId);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return reviewId;
    },
    onSuccess: (reviewId) => {
      // Update cache by incrementing the helpful count
      queryClient.setQueryData<ProductReview[]>(reviewsQueryKey, (oldData = []) => 
        oldData.map(review => 
          review.id === reviewId 
            ? { ...review, helpful: review.helpful + 1 } 
            : review
        )
      );
    }
  });
  
  return {
    reviews,
    isLoading,
    isError,
    error: error as Error | null,
    createReview: (data) => createReviewMutation.mutate(data),
    updateReview: (data) => updateReviewMutation.mutate(data),
    deleteReview: (reviewId) => deleteReviewMutation.mutate(reviewId),
    markHelpful: (reviewId) => markHelpfulMutation.mutate(reviewId),
    averageRating,
    totalReviews
  };
};
