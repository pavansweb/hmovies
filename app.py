from flask import Flask, render_template, request, redirect, url_for
import requests
import json     

app = Flask(__name__)

TMDB_API_KEY = '789c2869ddf724127863ae4e4780f6b6'  # Replace with your TMDB API key
VIDBINGE_API_URL = 'https://vidb.in/api/' #Replace with vidbinge url api if it has changed



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
    url = f'https://api.themoviedb.org/3/movie/{movie_id}?api_key={TMDB_API_KEY}'
    response = requests.get(url)
    response.raise_for_status()
    return response.json()


def get_vidbinge_links(title, year=None):
  """Searches Vidbinge for streaming links. title is required others are optional"""

  if not title:
    return "No movie title given to vidbinge links fetcher"

  search_query = f"{title} {year}" if year else title
  url = f"{VIDBINGE_API_URL}search?q={search_query}"


  try:
      response = requests.get(url)
      response.raise_for_status()
      data = response.json()
      movie_id = next((item['id'] for item in data['results'] if (item['title'].lower() == title.lower() and item.get('year') and str(item.get('year'))==year) ),None)


      if movie_id:
           links_url = f"{VIDBINGE_API_URL}sources/{movie_id}"
           links_response = requests.get(links_url)

           links_response.raise_for_status()
           links_data = links_response.json()

           return links_data.get('data', []) #return empty if links not found
      else :

           return []


  except requests.exceptions.RequestException as e:
      print(f"Error fetching links from Vidbinge: {e}")
      return []





if __name__ == '__main__':
    app.run(debug=True)