# Blogger Related Posts - Simple Configuration

Easy-to-use version with minimal configuration required. Just provide your blog URL and number of posts!

## 🚀 Quick Start

### 1. Basic Setup (3 steps)

```html
<!-- Step 1: Add container -->
<div id="related-posts"></div>

<!-- Step 2: Include files -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<link rel="stylesheet" href="blogger-related-posts-simple.css">
<script src="blogger-related-posts-config.js"></script>

<!-- Step 3: Initialize -->
<script>
$(document).ready(function() {
    $('#related-posts').bloggerRelatedPosts({
        blogUrl: 'https://yourblog.blogspot.com',
        maxPosts: 6
    });
});
</script>
```

### 2. Auto-Detection (Even Simpler!)

If you're adding this to your own Blogger template, you can skip the `blogUrl` - it will auto-detect:

```javascript
$('#related-posts').bloggerRelatedPosts({
    maxPosts: 6  // Only specify number of posts!
});
```

## ⚙️ Configuration Options

### Required Settings
| Option | Type | Description | Example |
|--------|------|-------------|---------|
| `blogUrl` | String | Your blog URL (auto-detected if empty) | `"https://yourblog.blogspot.com"` |

### Basic Settings
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxPosts` | Number | 6 | Number of posts to show (1-50) |
| `layout` | String | "grid" | Layout: "grid" or "list" |
| `showThumbnail` | Boolean | true | Show post images |
| `showDate` | Boolean | true | Show publication date |
| `showSummary` | Boolean | true | Show post excerpt |

## 📝 Usage Examples

### Minimal Configuration
```javascript
$('#related-posts').bloggerRelatedPosts({
    blogUrl: 'https://yourblog.blogspot.com',
    maxPosts: 4
});
```

### Grid Layout (Default)
```javascript
$('#related-posts').bloggerRelatedPosts({
    blogUrl: 'https://yourblog.blogspot.com',
    maxPosts: 6,
    layout: 'grid',
    showThumbnail: true,
    showDate: true,
    showSummary: true
});
```

### List Layout (Sidebar)
```javascript
$('#sidebar-related').bloggerRelatedPosts({
    blogUrl: 'https://yourblog.blogspot.com',
    maxPosts: 5,
    layout: 'list',
    showSummary: false
});
```

### Auto-Detection (For Blogger Templates)
```javascript
// No blogUrl needed - auto-detects current blog
$('#related-posts').bloggerRelatedPosts({
    maxPosts: 8,
    layout: 'grid'
});
```

## 🔧 Blogger Template Integration

### Method 1: Post Pages Only
```html
<b:if cond='data:blog.pageType == "item"'>
    <div class='related-posts-section'>
        <h3>Related Posts</h3>
        <div id='related-posts'></div>
    </div>
    
    <script src='https://code.jquery.com/jquery-3.6.0.min.js'></script>
    <link rel='stylesheet' href='blogger-related-posts-simple.css'/>
    <script src='blogger-related-posts-config.js'></script>
    
    <script>
    $(document).ready(function() {
        $('#related-posts').bloggerRelatedPosts({
            maxPosts: 6,
            layout: 'grid'
        });
    });
    </script>
</b:if>
```

### Method 2: With Custom Styling
```html
<div class='my-related-posts'>
    <h2>You Might Also Like</h2>
    <div id='related-posts'></div>
</div>

<style>
.my-related-posts {
    margin: 2rem 0;
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 0.75rem;
}

.my-related-posts h2 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #1e293b;
}
</style>

<script>
$('#related-posts').bloggerRelatedPosts({
    blogUrl: 'https://yourblog.blogspot.com',
    maxPosts: 4,
    layout: 'grid'
});
</script>
```

## 🎨 Customization

### Change Colors
```css
.brp-item:hover {
    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.15); /* Blue shadow */
}

.brp-title a:hover {
    color: #your-brand-color;
}
```

### Modify Spacing
```css
.brp-container {
    gap: 2rem; /* Increase spacing between items */
}

.brp-content {
    padding: 2rem; /* More padding inside cards */
}
```

## 🔍 Troubleshooting

### Common Issues

**1. "Unable to Load Related Posts"**
- Check if your `blogUrl` is correct
- Ensure your blog is public (not private)
- Verify the blog has published posts

**2. No Posts Showing**
- Try increasing `maxPosts` value
- Check if current post has labels/categories
- Verify blog feed is accessible: `yourblog.blogspot.com/feeds/posts/default`

**3. Images Not Loading**
- This is normal for lazy loading - images load as you scroll
- Check browser console for any errors

### Testing Your Configuration

Test your blog feed URL directly:
```
https://yourblog.blogspot.com/feeds/posts/default?alt=json-in-script&max-results=10
```

## 📱 Responsive Design

The library automatically adapts to different screen sizes:
- **Desktop**: Grid layout with multiple columns
- **Tablet**: 2 columns
- **Mobile**: Single column

## 🚀 Performance Features

- **Lazy Loading**: Images load only when needed
- **Caching**: Results cached for 5 minutes
- **Optimized Images**: Automatic thumbnail optimization
- **Fast Loading**: Minimal CSS and JavaScript

## 📊 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Internet Explorer 11+

## 📄 License

MIT License - Free for personal and commercial use.
