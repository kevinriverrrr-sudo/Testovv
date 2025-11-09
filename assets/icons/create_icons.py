from PIL import Image, ImageDraw

def create_icon(size):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    draw.rounded_rectangle([(0, 0), (size, size)], radius=size//5, fill=(102, 126, 234))
    
    stroke_width = max(2, size // 16)
    
    check_points = [
        (size * 0.3, size * 0.5),
        (size * 0.45, size * 0.65),
        (size * 0.7, size * 0.35)
    ]
    
    for i in range(len(check_points) - 1):
        x1, y1 = check_points[i]
        x2, y2 = check_points[i + 1]
        draw.line([(x1, y1), (x2, y2)], fill=(255, 255, 255), width=stroke_width)
    
    img.save(f'icon{size}.png')
    print(f'Created icon{size}.png')

create_icon(16)
create_icon(48)
create_icon(128)
