# Blogger Related Posts Pro

A production-ready, professional JavaScript library for displaying related posts on Google Blogger with advanced features including lazy loading, multiple layouts, and responsive design.

## 🚀 Features

### Core Features
- **🎨 Professional Design** - Modern, clean, and customizable UI
- **📱 Fully Responsive** - Optimized for all device sizes
- **⚡ Lazy Loading** - Intersection Observer API for optimal performance
- **🎭 Multiple Layouts** - Grid, List, Masonry, and Carousel layouts
- **🎪 Card Styles** - Classic, Modern, Minimal, and Magazine styles
- **🏷️ Smart Filtering** - Label-based post filtering
- **💾 Caching System** - Built-in result caching for better performance
- **♿ Accessibility** - ARIA labels, focus management, and keyboard navigation
- **🌙 Theme Support** - Light and dark theme compatibility

### Performance Features
- **Intersection Observer** for lazy image loading
- **Debounced resize handling** for smooth responsive behavior
- **Result caching** with configurable duration
- **Optimized thumbnail loading** with quality settings
- **Skeleton loading states** for better perceived performance

### Design Features
- **CSS Custom Properties** for easy theming
- **Smooth animations** with stagger effects
- **Hover effects** and micro-interactions
- **Professional typography** and spacing
- **High contrast mode** support
- **Print-friendly** styles

## 📦 Installation

### Method 1: Direct Integration

1. **Include jQuery** (if not already included):
```html
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
```

2. **Include the library files**:
```html
<link rel="stylesheet" href="blogger-related-posts-pro.css">
<script src="blogger-related-posts-pro.js"></script>
```

3. **Add HTML container**:
```html
<div id="related-posts"></div>
```

4. **Initialize the library**:
```javascript
$(document).ready(function() {
    $('#related-posts').bloggerRelatedPostsPro();
});
```

### Method 2: Blogger Template Integration

Add this code to your Blogger template:

```html
<!-- Related Posts Section -->
<b:if cond='data:blog.pageType == "item"'>
    <div class='related-posts-section'>
        <h3>You Might Also Like</h3>
        <div id='related-posts'></div>
    </div>
    
    <!-- Include jQuery if not already included -->
    <script src='https://code.jquery.com/jquery-3.6.0.min.js'></script>
    
    <!-- Include the library -->
    <link rel='stylesheet' href='PATH_TO/blogger-related-posts-pro.css'/>
    <script src='PATH_TO/blogger-related-posts-pro.js'></script>
    
    <script>
    $(document).ready(function() {
        $('#related-posts').bloggerRelatedPostsPro({
            layout: 'grid',
            cardStyle: 'modern',
            maxPosts: 6,
            showThumbnail: true,
            showDate: true,
            showSummary: true,
            showLabels: true,
            lazyLoading: true,
            fadeIn: true
        });
    });
    </script>
</b:if>
```

## ⚙️ Configuration Options

### Basic Settings
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxPosts` | Number | 6 | Maximum number of posts to display |
| `showThumbnail` | Boolean | true | Show post thumbnails |
| `showDate` | Boolean | true | Show post publication date |
| `showSummary` | Boolean | true | Show post summary/excerpt |
| `summaryLength` | Number | 120 | Maximum length of summary text |
| `showAuthor` | Boolean | false | Show post author |
| `showReadTime` | Boolean | true | Show estimated read time |
| `showLabels` | Boolean | true | Show post labels/tags |
| `maxLabels` | Number | 3 | Maximum number of labels to show |

### Layout & Design
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `layout` | String | 'grid' | Layout type: 'grid', 'list', 'masonry', 'carousel' |
| `columns` | String/Number | 'auto' | Number of columns: 'auto', 1, 2, 3, 4 |
| `cardStyle` | String | 'modern' | Card style: 'classic', 'modern', 'minimal', 'magazine' |

### Thumbnail Settings
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `thumbnailSize` | Number | 300 | Thumbnail size in pixels |
| `thumbnailQuality` | String | 'high' | Quality: 'low', 'medium', 'high' |
| `defaultThumbnail` | String | SVG placeholder | Default image when no thumbnail |

### Lazy Loading
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `lazyLoading` | Boolean | true | Enable lazy loading |
| `lazyLoadOffset` | Number | 100 | Offset in pixels for lazy loading trigger |
| `loadingAnimation` | Boolean | true | Show loading animation |
| `skeletonLoading` | Boolean | true | Show skeleton loading state |

### Animation
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `fadeIn` | Boolean | true | Enable fade-in animation |
| `fadeInDuration` | Number | 600 | Fade-in duration in milliseconds |
| `staggerDelay` | Number | 100 | Delay between item animations |
| `hoverEffects` | Boolean | true | Enable hover effects |

### Performance
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `cacheResults` | Boolean | true | Cache API results |
| `cacheDuration` | Number | 300000 | Cache duration in milliseconds (5 minutes) |
| `debounceResize` | Number | 250 | Resize event debounce delay |

### Accessibility
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ariaLabels` | Boolean | true | Add ARIA labels |
| `focusManagement` | Boolean | true | Manage focus for keyboard navigation |

## 🎨 Usage Examples

### Basic Usage
```javascript
$('#related-posts').bloggerRelatedPostsPro();
```

### Grid Layout with Modern Style
```javascript
$('#related-posts').bloggerRelatedPostsPro({
    layout: 'grid',
    cardStyle: 'modern',
    maxPosts: 6,
    showThumbnail: true,
    showSummary: true,
    showLabels: true,
    lazyLoading: true,
    fadeIn: true,
    staggerDelay: 150
});
```

### List Layout for Sidebar
```javascript
$('#sidebar-related').bloggerRelatedPostsPro({
    layout: 'list',
    cardStyle: 'minimal',
    maxPosts: 5,
    showThumbnail: true,
    showSummary: false,
    showDate: true,
    showLabels: false,
    columns: 1
});
```

### Carousel Layout
```javascript
$('#related-carousel').bloggerRelatedPostsPro({
    layout: 'carousel',
    cardStyle: 'modern',
    maxPosts: 8,
    showThumbnail: true,
    showSummary: true,
    summaryLength: 80,
    showLabels: true,
    maxLabels: 2
});
```

### Magazine Style
```javascript
$('#magazine-posts').bloggerRelatedPostsPro({
    layout: 'grid',
    cardStyle: 'magazine',
    maxPosts: 6,
    showThumbnail: true,
    showDate: true,
    showSummary: true,
    showAuthor: true,
    showLabels: true,
    showReadTime: true
});
```

### With Callbacks
```javascript
$('#related-posts').bloggerRelatedPostsPro({
    maxPosts: 6,
    onLoad: function(data) {
        console.log('Posts loaded:', data.feed.entry.length);
    },
    beforeRender: function(posts) {
        console.log('About to render:', posts.length, 'posts');
    },
    afterRender: function(posts) {
        console.log('Rendered successfully');
        // Add custom interactions
        $('.brp-item').on('click', function() {
            // Track clicks
            gtag('event', 'related_post_click', {
                'post_title': $(this).find('.brp-title').text()
            });
        });
    },
    onError: function(error) {
        console.error('Failed to load related posts:', error);
        // Show custom error message
        this.$container.html('<p class="custom-error">Unable to load posts. Please try again later.</p>');
    }
});
```

## 🎨 Theming and Customization

### CSS Custom Properties
The library uses CSS custom properties for easy theming:

```css
:root {
  --brp-primary-color: #2563eb;
  --brp-secondary-color: #64748b;
  --brp-accent-color: #f59e0b;
  --brp-text-primary: #1e293b;
  --brp-text-secondary: #64748b;
  --brp-background: #ffffff;
  --brp-surface: #f8fafc;
  --brp-border: #e2e8f0;
  --brp-radius: 0.75rem;
  --brp-spacing: 1.5rem;
}
```

### Dark Theme
Enable dark theme by adding the `data-theme="dark"` attribute:

```html
<html data-theme="dark">
```

Or toggle programmatically:
```javascript
document.documentElement.setAttribute('data-theme', 'dark');
```

### Custom Styling
Override default styles:

```css
/* Custom brand colors */
.brp-container {
  --brp-primary-color: #your-brand-color;
  --brp-accent-color: #your-accent-color;
}

/* Custom card styling */
.brp-item {
  border-radius: 1rem;
  overflow: hidden;
}

/* Custom hover effects */
.brp-hover-effects .brp-item:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
```

## 📱 Responsive Breakpoints

The library uses the following responsive breakpoints:

- **Mobile**: < 576px (1 column)
- **Tablet**: 576px - 768px (2 columns)
- **Desktop**: 768px - 992px (3 columns)
- **Large Desktop**: > 992px (3-4 columns)

## ♿ Accessibility Features

- **ARIA labels** for screen readers
- **Keyboard navigation** support
- **Focus management** for interactive elements
- **High contrast mode** support
- **Reduced motion** support
- **Semantic HTML** structure

## 🔧 API Methods

### Initialization
```javascript
$('#related-posts').bloggerRelatedPostsPro(options);
```

### Clear Cache
```javascript
$.bloggerRelatedPostsPro.clearCache();
```

### Destroy Instance
```javascript
// Access the instance and destroy
const instance = $('#related-posts').data('bloggerRelatedPostsPro');
if (instance) {
    instance.destroy();
}
```

## 🌐 Browser Support

- **Chrome** (latest)
- **Firefox** (latest)
- **Safari** (latest)
- **Edge** (latest)
- **Internet Explorer** 11+ (with polyfills)

## 📊 Performance

- **Lazy loading** reduces initial page load time
- **Image optimization** with quality settings
- **Result caching** prevents unnecessary API calls
- **Debounced events** for smooth interactions
- **Optimized CSS** with minimal reflows

## 🔒 Security

- **XSS protection** with proper content sanitization
- **HTTPS enforcement** for external resources
- **Content Security Policy** compatible

## 📝 License

MIT License - feel free to use in personal and commercial projects.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 📞 Support

For support and questions, please open an issue on the repository.

## 🔄 Changelog

### v2.0.0 (Current)
- ✨ Added lazy loading with Intersection Observer
- 🎨 Professional design with multiple card styles
- 📱 Enhanced responsive design
- ⚡ Performance optimizations
- ♿ Accessibility improvements
- 🌙 Dark theme support
- 🎪 Multiple layout options
- 💾 Built-in caching system
- 🎭 Smooth animations and transitions

### v1.0.0
- 🎉 Initial release
- Basic related posts functionality
- Configurable options
- Responsive design
