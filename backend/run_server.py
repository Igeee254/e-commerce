import uvicorn
import socket

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # doesn't even have to be reachable
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

if __name__ == "__main__":
    ip = get_ip()
    print(f"\nAlpha Boutique Smart Webs - Server Controller")
    print(f"================================================")
    print(f"LOCAL ACCESS:   http://127.0.0.1:8000")
    print(f"NETWORK ACCESS: http://{ip}:8000")
    print(f"================================================")
    print(f"TIP: If 'Network request failed' persists, try running")
    print(f"   'npx localtunnel --port 8000' in a NEW terminal")
    print(f"   and update constants/API.ts with the generated URL.\n")
    
    # Run on 0.0.0.0 to be accessible from other devices
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
