import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../../models/post';
import { LikeService } from '../../services/like.service';

@Component({
  selector: 'app-post-card',
  imports: [CommonModule],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
})
export class PostCard {
  @Input() post!: Post;
  @Output() viewDetails = new EventEmitter<number>();

  private likeService = inject(LikeService);
  isLiking = false;

  onLike(event: Event): void {
    event.stopPropagation(); // Empêcher la navigation vers les détails

    if (this.isLiking) return; // Éviter les double-clics

    this.isLiking = true;
    this.likeService.toggleLike(this.post.id).subscribe({
      next: (response) => {
        this.post.likedByCurrentUser = response.liked;
        this.post.likes += response.liked ? 1 : -1;
        setTimeout(() => this.isLiking = false, 300);
      },
      error: (err) => {
        console.error('Error toggling like:', err);
        this.isLiking = false;
      }
    });
  }

  onViewDetails(): void {
    this.viewDetails.emit(this.post.id);
  }

}
