from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1350
img = Image.new("RGB", (W, H), (44, 62, 58))
draw = ImageDraw.Draw(img)

# soft mint-teal vertical gradient background
top = (94, 214, 190)
bottom = (30, 110, 96)
for y in range(H):
    t = y / H
    r = int(top[0] * (1 - t) + bottom[0] * t)
    g = int(top[1] * (1 - t) + bottom[1] * t)
    b = int(top[2] * (1 - t) + bottom[2] * t)
    draw.line([(0, y), (W, y)], fill=(r, g, b))

font_path = "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"
font_title = ImageFont.truetype(font_path, 92)
font_sub = ImageFont.truetype(font_path, 44)

# simple slicer icon: rounded rectangle "board" + diagonal blade lines
board_x0, board_y0, board_x1, board_y1 = 260, 480, 820, 760
draw.rounded_rectangle([board_x0, board_y0, board_x1, board_y1], radius=40, fill=(255, 255, 255), outline=(20, 70, 60), width=6)
for i in range(6):
    x = board_x0 + 60 + i * 90
    draw.line([(x, board_y0 + 30), (x - 40, board_y1 - 30)], fill=(150, 200, 190), width=10)
draw.rounded_rectangle([board_x1 - 40, board_y0 - 20, board_x1 + 30, board_y1 + 20], radius=20, fill=(255, 214, 10))

def center_text(y, text, font, fill):
    bbox = draw.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0]
    draw.text(((W - w) / 2, y), text, font=font, fill=fill)

center_text(870, "고성능 채칼", font_title, (255, 255, 255))
center_text(990, "손이 안 다치는 안전 채칼", font_sub, (230, 255, 250))

img.save("/home/user/claude/shorts-pipeline/assets/products/chaekal-001.jpg", quality=92)
print("saved")
