from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_cors import CORS
import requests
import json     

app = Flask(__name__)
CORS(app)

TMDB_API_KEY = '789c2869ddf724127863ae4e4780f6b6'  # Replace with your TMDB API key
TMDB_BASE_URL = "https://api.themoviedb.org/3"

@app.route('/api/movies/<endpoint>', methods=['GET'])
def fetch_movies(endpoint):
    """Fetches movies from TMDB (e.g., popular, trending, upcoming)"""
    
    url = f"{TMDB_BASE_URL}/movie/{endpoint}?api_key={TMDB_API_KEY}&language=en-US&page=1"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        return jsonify(data)  # Send JSON response to frontend
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/search', methods=['GET'])
def search_movies():
    query = request.args.get('query', '')
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400

    url = f"https://api.themoviedb.org/3/search/movie?api_key={TMDB_API_KEY}&query={query}"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        return jsonify(data)
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

@app.route('/search', methods=['GET', 'POST'])
def search():
    query = request.args.get('q', '')
    page = int(request.args.get('page', 1)) #handle pagenation for load more

    if query:
        try:
            search_results = search_movies(query, page)
            return render_template('search.html', results=search_results, query=query, page=page)

        except Exception as e:
            print(f"Error during search: {e}")  # Log the error for debugging
            return render_template('search.html', error="Failed to fetch results. Please try again later.", query=query,page = page) #Inform user if theres an issue

    return render_template('search.html', query=query,page =page) #render if query is not there

def search_movies(query, page):
    url = f'https://api.themoviedb.org/3/search/movie?api_key={TMDB_API_KEY}&query={query}&page={page}'
    
    response = requests.get(url)
    response.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)
    data = response.json()
    return data.get('results', [])

@app.route('/')
@app.route('/home')  # Both routes point to the same function
def home():
    return render_template('index.html')

@app.route('/movie/<int:movie_id>')
def movie(movie_id):
    try:
        tmdb_data = get_movie_details(movie_id)
        vidbinge_embed_url = f"https://vidbinge.dev/embed/movie/{tmdb_data.get('id', movie_id)}" #use the  movie.id  passed if movie id doesnt exist for now as a reasonable alternative or handle case if no id given


        return render_template('movie.html', movie=tmdb_data, vidbinge_embed_url=vidbinge_embed_url) #pass in to render to the movie.html embed

    except Exception as e:
      print(f"Error fetching movie details: {e}")
      return render_template('error.html', message=str(e))


def get_movie_details(movie_id):
    url = f'https://api.themoviedb.org/3/movie/{movie_id}?api_key={TMDB_API_KEY}&append_to_response=credits'
    response = requests.get(url)
    response.raise_for_status()
    return response.json()


@app.route("/contact", methods=["GET", "POST"])
def contact():
    if request.method == "POST":
        name = request.form.get("name")
        email = request.form.get("email")
        message = request.form.get("message")
        
        # Here you could process/store the data, send an email, etc.
        return render_template("contact.html", success=True, name=name)
    
    return render_template("contact.html", success=False)
    
if __name__ == '__main__':
    app.run(debug=True)