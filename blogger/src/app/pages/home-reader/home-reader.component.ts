import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PostCard } from '../../components/post-card/post-card';
import { BlogService } from '../../services/blog.service';
import { Post } from '../../models/post';
import { HeaderComponent } from '../../components/header/header';

@Component({
  selector: 'app-home-reader',
  standalone: true,
  imports: [CommonModule, HeaderComponent, PostCard],
  templateUrl: './home-reader.component.html',
  styleUrl: './home-reader.component.css'
})
export class HomeReaderComponent implements OnInit {

  posts: Post[] = [];
  filteredPosts: Post[] = [];

  categories = ['Tous', 'Tech', 'Photo', 'Cuisine', 'Voyage', 'Lifestyle', 'Art', 'Musique'];
  selectedCategory = 'Tous';

  constructor(
    private blogService: BlogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('📖 HomeReader component initialisé');
    
    // Charger tous les blogs depuis la base de données
    this.blogService.loadPosts();
    
    // S'abonner aux changements de posts
    this.blogService.posts$.subscribe(posts => {
      console.log('📥 Posts reçus dans HomeReader:', posts);
      console.log('📊 Nombre de posts reçus:', posts.length);
      this.posts = posts;
      this.applyFilters();
      console.log('🔍 Posts après filtrage:', this.filteredPosts.length);
    });
  }

  /* ================== SEARCH ================== */
  onSearch(query: string): void {
    this.applyFilters(query);
  }

  /* ================== CATEGORY ================== */
  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  private applyFilters(search: string = ''): void {
    let result = [...this.posts];

    if (this.selectedCategory !== 'Tous') {
      result = result.filter(p => p.category === this.selectedCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q)
      );
    }

    this.filteredPosts = result;
  }

  /* ================== POST DETAILS ================== */
  onViewDetails(postId: number): void {
    this.router.navigate(['/post', postId]);
  }

  onViewChange(view: string): void {
    // Les readers ne peuvent pas créer de blogs, donc on ignore l'événement 'create'
    if (view === 'home') {
      this.router.navigate(['/reader/home']);
    }
  }
}
