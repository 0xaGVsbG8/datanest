import redis
import json

r_conn = redis.Redis(
    host="redis",
    port=6379,
    db=0,
    decode_responses=True,
)




def test_redis():

    r_conn.set("test", "test")
    value = r_conn.get("test")

    if not r_conn.get('upload_token_data_ls'):
        r_conn.set('upload_token_data_ls',json.dumps([]))
        
        
    if not r_conn.get('USERS_DIR_DOWNLOAD_REQUESTS_DATA'):
        r_conn.set('USERS_DIR_DOWNLOAD_REQUESTS_DATA',json.dumps([]))
        
        
        
    print('redis is working', value)
    